"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDuration, formatCost, timeAgo } from "@/lib/utils";

interface Trace {
  id: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string | null;
  totalTokens: number;
  totalCost: number;
  agent: { name: string; type: string } | null;
}

export function RecentTraces({ traces }: { traces: Trace[] }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Recent Traces</CardTitle>
        <Link
          href="/traces"
          className="text-xs text-indigo-400 hover:text-indigo-300"
        >
          View all
        </Link>
      </CardHeader>
      <div className="space-y-1">
        {traces.map((trace) => {
          const duration =
            trace.endTime
              ? new Date(trace.endTime).getTime() - new Date(trace.startTime).getTime()
              : null;
          return (
            <Link
              key={trace.id}
              href={`/traces?id=${trace.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-800/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusBadge status={trace.status} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {trace.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {trace.agent?.name ?? "Unknown"} &middot;{" "}
                    {timeAgo(new Date(trace.startTime))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-500 shrink-0">
                <span>{trace.totalTokens.toLocaleString()} tokens</span>
                <span>{formatCost(trace.totalCost)}</span>
                <span>{duration ? formatDuration(duration) : "..."}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
