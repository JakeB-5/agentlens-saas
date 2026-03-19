"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Code, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500">
          Configure your AgentLens project
        </p>
      </div>

      {/* API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-indigo-400" />
            <CardTitle className="text-base text-zinc-200">API Key</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">
            Use this key to authenticate your SDK and send traces to AgentLens.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 font-mono text-sm text-zinc-300">
              al_sk_demo_••••••••••••••••
            </code>
            <button className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800">
              Copy
            </button>
          </div>
        </div>
      </Card>

      {/* SDK Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-green-400" />
            <CardTitle className="text-base text-zinc-200">
              SDK Quick Start
            </CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500">Installation</p>
            <pre className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm text-zinc-300">
              npm install @agentlens/sdk
            </pre>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-500">Usage</p>
            <pre className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 font-mono text-sm text-green-300">
{`import { AgentLens } from '@agentlens/sdk';

const lens = new AgentLens({
  apiKey: 'al_sk_demo_...',
  endpoint: 'http://localhost:3000',
});

// Start a trace
const trace = lens.startTrace('my-workflow');

// Create spans
const span = trace.startSpan('llm_call', {
  model: 'gpt-4o',
  agent: 'researcher',
});

// End span with results
span.end({ tokens: 1500, cost: 0.045 });

// End trace
trace.end();`}
            </pre>
          </div>
        </div>
      </Card>

      {/* Endpoints */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-base text-zinc-200">
              API Endpoints
            </CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-2">
          {[
            { method: "GET", path: "/api/dashboard", desc: "Dashboard overview data" },
            { method: "GET", path: "/api/traces", desc: "List traces with filters" },
            { method: "POST", path: "/api/traces", desc: "Create new trace" },
            { method: "GET", path: "/api/traces/:id", desc: "Get trace with spans" },
            { method: "GET", path: "/api/agents", desc: "List agents and connections" },
            { method: "GET", path: "/api/alerts", desc: "List alerts and events" },
            { method: "POST", path: "/api/alerts", desc: "Create new alert" },
            { method: "POST", path: "/api/seed", desc: "Seed demo data" },
          ].map((endpoint) => (
            <div
              key={endpoint.path + endpoint.method}
              className="flex items-center gap-3 rounded-lg border border-zinc-800 px-4 py-2"
            >
              <span
                className={`rounded px-1.5 py-0.5 font-mono text-xs font-bold ${
                  endpoint.method === "GET"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-blue-500/10 text-blue-400"
                }`}
              >
                {endpoint.method}
              </span>
              <code className="font-mono text-sm text-zinc-300">
                {endpoint.path}
              </code>
              <span className="text-xs text-zinc-600">{endpoint.desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
