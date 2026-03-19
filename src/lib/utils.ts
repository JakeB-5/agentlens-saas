import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

export function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
    case "active":
    case "resolved":
      return "text-green-400";
    case "running":
    case "in_progress":
      return "text-blue-400";
    case "failed":
    case "error":
    case "triggered":
      return "text-red-400";
    case "timeout":
    case "warning":
      return "text-yellow-400";
    case "idle":
    case "stopped":
    case "acknowledged":
      return "text-zinc-400";
    default:
      return "text-zinc-500";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case "completed":
    case "active":
      return "bg-green-500/10 border-green-500/20";
    case "running":
      return "bg-blue-500/10 border-blue-500/20";
    case "failed":
    case "error":
      return "bg-red-500/10 border-red-500/20";
    case "timeout":
      return "bg-yellow-500/10 border-yellow-500/20";
    default:
      return "bg-zinc-500/10 border-zinc-500/20";
  }
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
