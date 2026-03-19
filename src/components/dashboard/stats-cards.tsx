"use client";

import { Card, CardTitle, CardValue } from "@/components/ui/card";
import { Activity, Bot, AlertTriangle, DollarSign, Clock } from "lucide-react";
import { formatCost, formatNumber, formatDuration } from "@/lib/utils";

interface StatsCardsProps {
  data: {
    totalTraces: number;
    activeAgents: number;
    errorRate: string;
    totalCost: number;
    avgLatency: number;
  };
}

export function StatsCards({ data }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Traces",
      value: formatNumber(data.totalTraces),
      icon: Activity,
      color: "text-blue-400",
    },
    {
      title: "Active Agents",
      value: data.activeAgents.toString(),
      icon: Bot,
      color: "text-green-400",
    },
    {
      title: "Error Rate",
      value: `${data.errorRate}%`,
      icon: AlertTriangle,
      color: parseFloat(data.errorRate) > 5 ? "text-red-400" : "text-yellow-400",
    },
    {
      title: "Total Cost",
      value: formatCost(data.totalCost),
      icon: DollarSign,
      color: "text-purple-400",
    },
    {
      title: "Avg Latency",
      value: formatDuration(data.avgLatency),
      icon: Clock,
      color: "text-cyan-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{card.title}</CardTitle>
              <CardValue className="mt-1">{card.value}</CardValue>
            </div>
            <card.icon className={`h-8 w-8 ${card.color} opacity-50`} />
          </div>
        </Card>
      ))}
    </div>
  );
}
