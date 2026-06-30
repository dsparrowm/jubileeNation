import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  trend?: { dir: "up" | "down"; value: string };
  hint?: string;
  sparkline?: React.ReactNode;
  className?: string;
  iconTone?: "gold" | "navy" | "info" | "success" | "warning" | "error";
}

const iconToneCls: Record<NonNullable<StatCardProps["iconTone"]>, string> = {
  gold: "bg-[--accent-primary]/10 text-[--accent-hover]",
  navy: "bg-[--bg-sidebar]/10 text-[--bg-sidebar]",
  info: "bg-blue-50 text-[--state-info]",
  success: "bg-green-50 text-[--state-success]",
  warning: "bg-amber-50 text-[--state-warning]",
  error: "bg-red-50 text-[--state-error]",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  hint,
  sparkline,
  iconTone = "gold",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "card-hover rounded-xl border border-[--border-default] bg-[--bg-surface] p-5",
        "shadow-[var(--shadow-card-token)]",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconToneCls[iconTone])}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px] font-medium font-mono",
              trend.dir === "up" ? "text-[--state-success] bg-green-50" : "text-[--state-error] bg-red-50",
            )}
          >
            {trend.dir === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="font-display font-mono text-3xl font-bold tracking-tight text-[--text-primary]">
          {value}
        </div>
        <div className="mt-1 text-sm text-[--text-muted] font-medium">{label}</div>
        {hint && <div className="mt-1 text-xs text-[--text-muted]">{hint}</div>}
        {sparkline && <div className="mt-3 h-8">{sparkline}</div>}
      </div>
    </div>
  );
}
