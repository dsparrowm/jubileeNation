import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Music, Clock, Plus, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { useRole } from "@/lib/role-context";
import { servicePlans, branchName } from "@/lib/data/seed";
import { formatDate } from "@/lib/format";
import type { ServicePlan } from "@/lib/data/types";

export const Route = createFileRoute("/dashboard/services")({ component: ServicesPage });

function ServicesPage() {
  const { user } = useRole();
  const branchId = user.branchId ?? "br-001";
  const plans = servicePlans.filter((p) => p.branchId === branchId);
  const [selectedId, setSelectedId] = React.useState<string | null>(plans[0]?.id ?? null);

  const selected = plans.find((p) => p.id === selectedId) ?? plans[0] ?? null;
  const totalDuration = selected?.segments.reduce((s, seg) => s + seg.duration, 0) ?? 0;

  return (
    <>
      <PageHeader
        title="Service Planner"
        description={`Plan and review Sunday service order for ${branchName(branchId)}.`}
        actions={
          <Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> New Service Plan
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg">
        <StatCard icon={Music} label="Plans" value={plans.length} iconTone="gold" />
        <StatCard icon={Clock} label="Duration" value={selected ? `${totalDuration} min` : "—"} iconTone="navy" />
        <StatCard icon={ChevronRight} label="Next Service" value={selected ? formatDate(selected.date) : "—"} iconTone="info" />
      </div>

      {plans.length === 0 ? (
        <Card className="mt-4">
          <EmptyState
            icon={Music}
            title="No service plans"
            description="Create your first service plan for this branch."
            action={{ label: "Create Plan" }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-sm">Service Dates</CardTitle></CardHeader>
            <ul className="divide-y divide-[--border-default]">
              {plans.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full text-left px-5 py-3.5 hover:bg-[--bg-base]/60 transition-colors ${
                      selected?.id === p.id ? "bg-[--bg-base] border-l-2 border-l-[--accent-primary]" : ""
                    }`}
                  >
                    <div className="font-medium text-sm">{formatDate(p.date)}</div>
                    <div className="text-xs text-[--text-muted] mt-0.5 truncate">{p.theme}</div>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {selected && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>{selected.theme}</CardTitle>
                  <p className="text-xs text-[--text-muted] mt-0.5 font-mono">
                    {formatDate(selected.date)} · {totalDuration} minutes total
                  </p>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <ServiceTimeline plan={selected} />
                {selected.notes && (
                  <div className="mt-5 rounded-lg bg-[--bg-base] p-4 text-sm">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[--text-muted] mb-1">Notes</div>
                    {selected.notes}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

function ServiceTimeline({ plan }: { plan: ServicePlan }) {
  let elapsed = 0;
  const total = plan.segments.reduce((s, seg) => s + seg.duration, 0);

  return (
    <div className="space-y-0">
      {plan.segments.map((seg, i) => {
        const startMin = elapsed;
        elapsed += seg.duration;
        const widthPct = (seg.duration / total) * 100;

        return (
          <div key={seg.id} className="flex gap-4 group">
            <div className="flex flex-col items-center w-14 shrink-0">
              <div className="font-mono text-[10px] text-[--text-muted]">{String(startMin).padStart(2, "0")}:00</div>
              <div className={`w-0.5 flex-1 min-h-[24px] ${i < plan.segments.length - 1 ? "bg-[--border-default]" : ""}`} />
            </div>
            <div className="flex-1 pb-5">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-sm">{seg.title}</div>
                <span className="text-xs font-mono text-[--text-muted] shrink-0">{seg.duration} min</span>
              </div>
              <div className="text-xs text-[--text-muted] mt-0.5">{seg.assignee}</div>
              <div className="mt-2 h-2 rounded-full bg-[--bg-base] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[--accent-primary] transition-all group-hover:bg-[--accent-hover]"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
