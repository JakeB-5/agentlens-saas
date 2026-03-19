"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Bell, Plus, Loader2 } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface AlertEvent {
  id: string;
  value: number;
  message: string;
  status: string;
  triggeredAt: string;
}

interface Alert {
  id: string;
  name: string;
  type: string;
  condition: string;
  threshold: number;
  window: number;
  enabled: boolean;
  events: AlertEvent[];
  _count: { events: number };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", type: "error_rate", threshold: "10" });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const res = await fetch("/api/alerts");
    if (res.ok) setAlerts(await res.json());
    setLoading(false);
  };

  const createAlert = async () => {
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        type: form.type,
        threshold: parseFloat(form.threshold),
      }),
    });
    setShowCreate(false);
    setForm({ name: "", type: "error_rate", threshold: "10" });
    fetchAlerts();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "error_rate": return "Error Rate (%)";
      case "latency": return "Latency (ms)";
      case "cost": return "Cost ($)";
      case "token_usage": return "Token Usage";
      default: return type;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Alerts</h1>
          <p className="text-sm text-zinc-500">
            Configure alerts and circuit breakers for your agents
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          New Alert
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create Alert</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Alert name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
            />
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="error_rate">Error Rate</option>
              <option value="latency">Latency</option>
              <option value="cost">Cost</option>
              <option value="token_usage">Token Usage</option>
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Threshold"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={createAlert}
                disabled={!form.name}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Bell className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-200">
                    {alert.name}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {getTypeLabel(alert.type)} &gt; {alert.threshold} &middot;
                    Window: {alert.window}s &middot;
                    {alert._count.events} events total
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  alert.enabled
                    ? "bg-green-500/10 text-green-400"
                    : "bg-zinc-500/10 text-zinc-500"
                }`}
              >
                {alert.enabled ? "Active" : "Disabled"}
              </span>
            </div>

            {/* Recent Events */}
            {alert.events.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-zinc-500">Recent Events</p>
                {alert.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge status={event.status} />
                      <span className="text-xs text-zinc-400">{event.message}</span>
                    </div>
                    <span className="text-xs text-zinc-600">
                      {timeAgo(new Date(event.triggeredAt))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
