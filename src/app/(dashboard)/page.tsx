"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTraces } from "@/components/dashboard/recent-traces";
import { AgentOverview } from "@/components/dashboard/agent-overview";
import { RefreshCw, Loader2 } from "lucide-react";

interface DashboardData {
  overview: {
    totalTraces: number;
    activeAgents: number;
    errorRate: string;
    totalCost: number;
    avgLatency: number;
  };
  recentTraces: Array<{
    id: string;
    name: string;
    status: string;
    startTime: string;
    endTime: string | null;
    totalTokens: number;
    totalCost: number;
    agent: { name: string; type: string } | null;
  }>;
  agentStats: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    _count: { traces: number; spans: number };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        setData(await res.json());
      } else if (res.status === 404) {
        setData(null);
      }
    } catch {
      // API not ready yet
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      await fetchData();
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">No data yet. Seed demo data to get started.</p>
        <button
          onClick={seedData}
          disabled={seeding}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {seeding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Seed Demo Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            Multi-agent system observability overview
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      <StatsCards data={data.overview} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTraces traces={data.recentTraces} />
        </div>
        <div>
          <AgentOverview agents={data.agentStats} />
        </div>
      </div>
    </div>
  );
}
