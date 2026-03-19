"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDuration, formatCost, timeAgo, getStatusColor } from "@/lib/utils";
import { Search, Filter, ChevronRight, Loader2 } from "lucide-react";

interface Trace {
  id: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string | null;
  totalTokens: number;
  totalCost: number;
  agent: { name: string; type: string } | null;
  _count: { spans: number };
}

interface Span {
  id: string;
  name: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string | null;
  tokens: number;
  cost: number;
  model: string | null;
  latencyMs: number | null;
  input: string | null;
  output: string | null;
  agent: { name: string; type: string } | null;
}

interface TraceDetail {
  id: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string | null;
  totalTokens: number;
  totalCost: number;
  agent: { name: string; type: string } | null;
  spans: Span[];
}

export default function TracesPage() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<TraceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchTraces = async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/traces?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTraces(data.traces);
      }
      setLoading(false);
    };
    fetchTraces();
  }, [statusFilter]);

  const loadTraceDetail = async (id: string) => {
    const res = await fetch(`/api/traces/${id}`);
    if (res.ok) {
      setSelectedTrace(await res.json());
    }
  };

  const filteredTraces = traces.filter((t) =>
    t.name.toLowerCase().includes(filter.toLowerCase())
  );

  const getSpanTypeColor = (type: string) => {
    switch (type) {
      case "llm_call": return "border-l-blue-500 bg-blue-500/5";
      case "tool_call": return "border-l-green-500 bg-green-500/5";
      case "agent_handoff": return "border-l-purple-500 bg-purple-500/5";
      case "message": return "border-l-yellow-500 bg-yellow-500/5";
      case "retrieval": return "border-l-cyan-500 bg-cyan-500/5";
      default: return "border-l-zinc-500 bg-zinc-500/5";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Trace Explorer</h1>
        <p className="text-sm text-zinc-500">
          Inspect agent workflows and individual spans
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search traces..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-8 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none appearance-none"
          >
            <option value="">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Trace List */}
        <div className="lg:col-span-2 space-y-1">
          {filteredTraces.map((trace) => {
            const duration =
              trace.endTime
                ? new Date(trace.endTime).getTime() - new Date(trace.startTime).getTime()
                : null;
            const isSelected = selectedTrace?.id === trace.id;
            return (
              <button
                key={trace.id}
                onClick={() => loadTraceDetail(trace.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-indigo-500/50 bg-indigo-500/5"
                    : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/30"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={trace.status} />
                    <span className="text-xs text-zinc-600">{trace._count.spans} spans</span>
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-zinc-200">
                    {trace.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {trace.agent?.name} &middot; {timeAgo(new Date(trace.startTime))}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right text-xs text-zinc-500">
                    <p>{formatCost(trace.totalCost)}</p>
                    <p>{duration ? formatDuration(duration) : "..."}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Trace Detail */}
        <div className="lg:col-span-3">
          {selectedTrace ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-zinc-200">
                      {selectedTrace.name}
                    </CardTitle>
                    <p className="text-xs text-zinc-500 mt-1">
                      {selectedTrace.id} &middot;{" "}
                      {selectedTrace.spans.length} spans &middot;{" "}
                      {selectedTrace.totalTokens.toLocaleString()} tokens &middot;{" "}
                      {formatCost(selectedTrace.totalCost)}
                    </p>
                  </div>
                  <StatusBadge status={selectedTrace.status} />
                </div>
              </CardHeader>

              {/* Span Waterfall */}
              <div className="space-y-2">
                {selectedTrace.spans.map((span) => (
                  <div
                    key={span.id}
                    className={`rounded-lg border-l-2 border border-zinc-800 p-3 ${getSpanTypeColor(span.type)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                          span.type === "llm_call" ? "bg-blue-500/20 text-blue-300" :
                          span.type === "tool_call" ? "bg-green-500/20 text-green-300" :
                          span.type === "agent_handoff" ? "bg-purple-500/20 text-purple-300" :
                          span.type === "retrieval" ? "bg-cyan-500/20 text-cyan-300" :
                          "bg-yellow-500/20 text-yellow-300"
                        }`}>
                          {span.type}
                        </span>
                        <span className="text-sm text-zinc-300">{span.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        {span.model && (
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono">
                            {span.model}
                          </span>
                        )}
                        <span className={getStatusColor(span.status)}>{span.status}</span>
                        {span.latencyMs && <span>{formatDuration(span.latencyMs)}</span>}
                        {span.tokens > 0 && <span>{span.tokens} tok</span>}
                      </div>
                    </div>
                    {span.agent && (
                      <p className="mt-1 text-xs text-zinc-600">
                        Agent: {span.agent.name} ({span.agent.type})
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
              <p className="text-sm text-zinc-600">Select a trace to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
