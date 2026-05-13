import * as React from "react";
import { cn } from "@/lib/utils";
import type { PastoralRank } from "@/lib/data/types";

type Tone = "neutral" | "info" | "success" | "warning" | "error" | "gold" | "indigo" | "purple";

const toneClass: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  info: "bg-blue-50 text-[--state-info] ring-blue-100",
  success: "bg-green-50 text-[--state-success] ring-green-100",
  warning: "bg-amber-50 text-[--state-warning] ring-amber-100",
  error: "bg-red-50 text-[--state-error] ring-red-100",
  gold: "bg-[--accent-primary]/10 text-[--accent-hover] ring-[--accent-primary]/30",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  purple: "bg-purple-50 text-purple-700 ring-purple-100",
};

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap",
      toneClass[tone],
      className
    )}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, Tone> = {
    Active: "success", Compliant: "success", Approved: "success", Submitted: "success", Paid: "success",
    Pending: "warning", Partial: "warning", "On Leave": "warning",
    Overdue: "error", Outstanding: "error", Rejected: "error", Inactive: "error",
    Transferred: "info", Urgent: "error", Normal: "neutral",
  };
  return <Badge tone={map[status] ?? "neutral"}>{status}</Badge>;
}

export function RankBadge({ rank }: { rank: PastoralRank }) {
  const tone: Tone =
    rank === "Deacon" ? "neutral"
    : rank === "Pastor" ? "info"
    : rank === "Senior Pastor" ? "indigo"
    : rank === "Zonal Pastor" ? "purple"
    : "gold";
  return <Badge tone={tone}>{rank}</Badge>;
}
