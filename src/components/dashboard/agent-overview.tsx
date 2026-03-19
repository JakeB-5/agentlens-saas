"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Bot } from "lucide-react";

interface AgentStat {
  id: string;
  name: string;
  type: string;
  status: string;
  _count: { traces: number; spans: number };
}

export function AgentOverview({ agents }: { agents: AgentStat[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Overview</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                <Bot className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">{agent.name}</p>
                <p className="text-xs text-zinc-500">{agent.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-zinc-500">
                  {agent._count.traces} traces &middot; {agent._count.spans} spans
                </p>
              </div>
              <StatusBadge status={agent.status} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
