import { cn, getStatusColor, getStatusBgColor } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        getStatusBgColor(status),
        getStatusColor(status),
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "running" || status === "active"
            ? "animate-pulse"
            : "",
          status === "completed" || status === "active"
            ? "bg-green-400"
            : status === "running"
            ? "bg-blue-400"
            : status === "failed" || status === "error"
            ? "bg-red-400"
            : "bg-zinc-400"
        )}
      />
      {status}
    </span>
  );
}
