/**
 * AgentLens SDK - Lightweight instrumentation for multi-agent systems
 *
 * Usage:
 *   const lens = new AgentLens({ apiKey: 'al_sk_...', endpoint: 'http://localhost:3000' });
 *   const trace = lens.startTrace('my-workflow');
 *   const span = trace.startSpan('llm_call', { model: 'gpt-4o', agent: 'researcher' });
 *   span.end({ tokens: 1500, cost: 0.045 });
 *   trace.end();
 */

interface AgentLensConfig {
  apiKey: string;
  endpoint: string;
  projectId?: string;
}

interface SpanOptions {
  model?: string;
  agent?: string;
  parentSpanId?: string;
  input?: unknown;
}

interface SpanEndOptions {
  tokens?: number;
  cost?: number;
  output?: unknown;
  status?: "completed" | "failed";
}

class LensSpan {
  public readonly id: string;
  private readonly traceId: string;
  private readonly config: AgentLensConfig;
  private readonly startTime: Date;

  constructor(
    public readonly name: string,
    public readonly type: string,
    traceId: string,
    config: AgentLensConfig,
    private readonly options: SpanOptions = {}
  ) {
    this.id = crypto.randomUUID();
    this.traceId = traceId;
    this.config = config;
    this.startTime = new Date();
  }

  async end(opts: SpanEndOptions = {}) {
    const endTime = new Date();
    const latencyMs = endTime.getTime() - this.startTime.getTime();

    try {
      await fetch(`${this.config.endpoint}/api/traces/${this.traceId}/spans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          id: this.id,
          name: this.name,
          type: this.type,
          status: opts.status ?? "completed",
          startTime: this.startTime.toISOString(),
          endTime: endTime.toISOString(),
          tokens: opts.tokens ?? 0,
          cost: opts.cost ?? 0,
          model: this.options.model,
          latencyMs,
          agentName: this.options.agent,
          parentSpanId: this.options.parentSpanId,
          input: this.options.input ? JSON.stringify(this.options.input) : null,
          output: opts.output ? JSON.stringify(opts.output) : null,
        }),
      });
    } catch {
      // Silently fail to not disrupt the host application
    }
  }
}

class LensTrace {
  public readonly id: string;
  private readonly config: AgentLensConfig;
  private readonly startTime: Date;
  private totalTokens = 0;
  private totalCost = 0;

  constructor(
    public readonly name: string,
    config: AgentLensConfig,
    id: string
  ) {
    this.config = config;
    this.id = id;
    this.startTime = new Date();
  }

  startSpan(type: string, options: SpanOptions & { name?: string } = {}): LensSpan {
    const spanName = options.name ?? `${type}_${Date.now()}`;
    return new LensSpan(spanName, type, this.id, this.config, options);
  }

  async end(status: "completed" | "failed" = "completed") {
    try {
      await fetch(`${this.config.endpoint}/api/traces/${this.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          status,
          endTime: new Date().toISOString(),
          totalTokens: this.totalTokens,
          totalCost: this.totalCost,
        }),
      });
    } catch {
      // Silently fail
    }
  }

  addTokens(tokens: number, cost: number) {
    this.totalTokens += tokens;
    this.totalCost += cost;
  }
}

export class AgentLens {
  private readonly config: AgentLensConfig;

  constructor(config: AgentLensConfig) {
    this.config = config;
  }

  async startTrace(name: string, options: { agentId?: string } = {}): Promise<LensTrace> {
    try {
      const res = await fetch(`${this.config.endpoint}/api/traces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          name,
          status: "running",
          agentId: options.agentId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return new LensTrace(name, this.config, data.id);
      }
    } catch {
      // Silently fail
    }

    // Return a no-op trace if API fails
    return new LensTrace(name, this.config, crypto.randomUUID());
  }
}

export type { AgentLensConfig, SpanOptions, SpanEndOptions };
