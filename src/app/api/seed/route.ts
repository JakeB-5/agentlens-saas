import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Clear existing data
    await prisma.alertEvent.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.span.deleteMany();
    await prisma.trace.deleteMany();
    await prisma.agentConnection.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.project.deleteMany();

    // Create project
    const project = await prisma.project.create({
      data: { name: "Demo Multi-Agent System" },
    });

    // Create agents
    const orchestrator = await prisma.agent.create({
      data: {
        name: "Orchestrator",
        type: "orchestrator",
        status: "active",
        description: "Main coordinator that routes tasks to specialized agents",
        projectId: project.id,
      },
    });

    const researcher = await prisma.agent.create({
      data: {
        name: "Researcher",
        type: "worker",
        status: "active",
        description: "Searches and retrieves relevant information",
        projectId: project.id,
      },
    });

    const analyst = await prisma.agent.create({
      data: {
        name: "Analyst",
        type: "worker",
        status: "active",
        description: "Analyzes data and generates insights",
        projectId: project.id,
      },
    });

    const writer = await prisma.agent.create({
      data: {
        name: "Writer",
        type: "worker",
        status: "idle",
        description: "Generates reports and documentation",
        projectId: project.id,
      },
    });

    const reviewer = await prisma.agent.create({
      data: {
        name: "Reviewer",
        type: "worker",
        status: "active",
        description: "Reviews and validates outputs for quality",
        projectId: project.id,
      },
    });

    const toolAgent = await prisma.agent.create({
      data: {
        name: "ToolExecutor",
        type: "tool",
        status: "active",
        description: "Executes external API calls and tool operations",
        projectId: project.id,
      },
    });

    const agents = [orchestrator, researcher, analyst, writer, reviewer, toolAgent];

    // Create connections
    const connectionData = [
      { sourceAgentId: orchestrator.id, targetAgentId: researcher.id, messageCount: 145, avgLatencyMs: 230 },
      { sourceAgentId: orchestrator.id, targetAgentId: analyst.id, messageCount: 98, avgLatencyMs: 180 },
      { sourceAgentId: orchestrator.id, targetAgentId: writer.id, messageCount: 67, avgLatencyMs: 150 },
      { sourceAgentId: researcher.id, targetAgentId: orchestrator.id, messageCount: 140, avgLatencyMs: 1200 },
      { sourceAgentId: researcher.id, targetAgentId: toolAgent.id, messageCount: 89, avgLatencyMs: 450 },
      { sourceAgentId: analyst.id, targetAgentId: orchestrator.id, messageCount: 95, avgLatencyMs: 800 },
      { sourceAgentId: analyst.id, targetAgentId: writer.id, messageCount: 34, avgLatencyMs: 200 },
      { sourceAgentId: writer.id, targetAgentId: reviewer.id, messageCount: 52, avgLatencyMs: 350 },
      { sourceAgentId: reviewer.id, targetAgentId: orchestrator.id, messageCount: 48, avgLatencyMs: 600 },
      { sourceAgentId: reviewer.id, targetAgentId: writer.id, messageCount: 23, errorCount: 3, avgLatencyMs: 280 },
      { sourceAgentId: toolAgent.id, targetAgentId: researcher.id, messageCount: 85, errorCount: 7, avgLatencyMs: 2100 },
    ];

    for (const conn of connectionData) {
      await prisma.agentConnection.create({ data: conn });
    }

    // Create traces with spans
    const traceNames = [
      "Market Research Report Generation",
      "Customer Sentiment Analysis",
      "Competitor Pricing Review",
      "Product Feature Extraction",
      "Weekly Summary Report",
      "Data Pipeline Validation",
      "User Feedback Synthesis",
      "Revenue Forecast Update",
      "Content Quality Audit",
      "API Integration Test",
      "Knowledge Base Update",
      "Risk Assessment Report",
      "Performance Benchmark Run",
      "Customer Journey Analysis",
      "Quarterly Metrics Compilation",
    ];

    const statuses = ["completed", "completed", "completed", "completed", "failed", "completed", "running", "completed", "completed", "completed", "completed", "failed", "completed", "completed", "completed"];
    const models = ["gpt-4o", "claude-3.5-sonnet", "gpt-4o-mini", "claude-3-haiku", "gpt-4o"];

    for (let i = 0; i < traceNames.length; i++) {
      const startTime = new Date(Date.now() - Math.random() * 86400000 * 3);
      const durationMs = 2000 + Math.random() * 15000;
      const endTime = statuses[i] !== "running" ? new Date(startTime.getTime() + durationMs) : null;
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const totalTokens = Math.floor(500 + Math.random() * 8000);
      const totalCost = totalTokens * 0.00003 + Math.random() * 0.05;

      const trace = await prisma.trace.create({
        data: {
          name: traceNames[i],
          status: statuses[i],
          startTime,
          endTime,
          totalTokens,
          totalCost,
          projectId: project.id,
          agentId: agent.id,
        },
      });

      // Create spans for each trace
      const spanCount = 3 + Math.floor(Math.random() * 6);
      const spanIds: string[] = [];

      for (let j = 0; j < spanCount; j++) {
        const spanTypes = ["llm_call", "tool_call", "agent_handoff", "message", "retrieval"];
        const spanType = spanTypes[Math.floor(Math.random() * spanTypes.length)];
        const spanStart = new Date(startTime.getTime() + (durationMs / spanCount) * j);
        const spanDuration = durationMs / spanCount;
        const spanEnd = statuses[i] === "running" && j === spanCount - 1
          ? null
          : new Date(spanStart.getTime() + spanDuration);
        const spanTokens = Math.floor(totalTokens / spanCount);
        const spanAgent = spanType === "agent_handoff"
          ? agents[Math.floor(Math.random() * agents.length)]
          : agent;

        const spanName = spanType === "llm_call" ? "LLM Inference"
          : spanType === "tool_call" ? "Tool: web_search"
          : spanType === "agent_handoff" ? `Handoff → ${spanAgent.name}`
          : spanType === "retrieval" ? "RAG Retrieval"
          : "Message Exchange";

        // Create span without parentSpanId to avoid self-referential type inference
        const newSpan = await prisma.span.create({
          data: {
            name: `${spanName} #${j + 1}`,
            type: spanType,
            status: spanEnd ? (Math.random() > 0.1 ? "completed" : "failed") : "running",
            startTime: spanStart,
            endTime: spanEnd,
            tokens: spanTokens,
            cost: spanTokens * 0.00003,
            model: spanType === "llm_call" ? models[Math.floor(Math.random() * models.length)] : null,
            latencyMs: spanEnd ? Math.round(spanDuration) : null,
            traceId: trace.id,
            agentId: spanAgent.id,
            input: JSON.stringify({ prompt: `Step ${j + 1} input...` }),
            output: spanEnd ? JSON.stringify({ result: `Step ${j + 1} output...` }) : null,
          },
          select: { id: true },
        });
        spanIds.push(newSpan.id);
      }

      // Link some spans to parents
      for (let j = 1; j < spanIds.length; j++) {
        if (Math.random() > 0.5) {
          await prisma.span.update({
            where: { id: spanIds[j] },
            data: { parentSpanId: spanIds[j - 1] },
          });
        }
      }
    }

    // Create alerts
    const alerts = [
      { name: "High Error Rate", type: "error_rate", condition: "gt", threshold: 10, window: 300 },
      { name: "Latency Spike", type: "latency", condition: "gt", threshold: 5000, window: 60 },
      { name: "Cost Threshold", type: "cost", condition: "gt", threshold: 1.0, window: 3600 },
      { name: "Token Budget Alert", type: "token_usage", condition: "gt", threshold: 100000, window: 3600 },
    ];

    for (const alertData of alerts) {
      const alert = await prisma.alert.create({
        data: { ...alertData, projectId: project.id },
      });

      // Create some alert events
      const eventCount = Math.floor(Math.random() * 4);
      for (let k = 0; k < eventCount; k++) {
        await prisma.alertEvent.create({
          data: {
            alertId: alert.id,
            value: alertData.threshold * (1 + Math.random() * 0.5),
            message: `${alertData.name} exceeded threshold: ${alertData.threshold}`,
            status: k === 0 ? "triggered" : "resolved",
            triggeredAt: new Date(Date.now() - Math.random() * 86400000),
          },
        });
      }
    }

    return NextResponse.json({
      message: "Demo data seeded successfully",
      project: project.name,
      agents: agents.length,
      traces: traceNames.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
