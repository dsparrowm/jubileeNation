import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, FileBarChart, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import { StatusBadge } from "@/components/ui-kit/badges";
import { DataTable, type Column } from "@/components/ui-kit/data-table";
import { useRole } from "@/lib/role-context";
import { filterBranches } from "@/lib/data/filters";
import {
  complianceSnapshots,
  branches,
  states,
  branchName,
  stateName,
  findBranch,
} from "@/lib/data/seed";
import { formatDate } from "@/lib/format";
import type { ComplianceSnapshot } from "@/lib/data/types";

export const Route = createFileRoute("/dashboard/compliance")({ component: CompliancePage });

function statusColor(status: string): string {
  if (status === "Compliant" || status === "Submitted" || status === "Approved") return "bg-[--state-success]";
  if (status === "Partial" || status === "Pending") return "bg-[--state-warning]";
  if (status === "Overdue" || status === "Outstanding") return "bg-[--state-error]";
  return "bg-slate-200";
}

function CompliancePage() {
  const { role, user } = useRole();
  const [stateFilter, setStateFilter] = React.useState<string>(
    role === "STATE_PASTOR" && user.stateId ? user.stateId : "all",
  );

  const visibleBranches = filterBranches({ role, user }, branches);
  const visibleBranchIds = new Set(visibleBranches.map((b) => b.id));

  let snapshots = complianceSnapshots.filter((c) => visibleBranchIds.has(c.branchId));
  if (stateFilter !== "all") {
    snapshots = snapshots.filter((c) => findBranch(c.branchId)?.stateId === stateFilter);
  }

  const reportCompliant = snapshots.filter((s) => s.reportStatus === "Submitted" || s.reportStatus === "Approved").length;
  const remitCompliant = snapshots.filter((s) => s.remitStatus === "Compliant").length;
  const atRisk = snapshots.filter(
    (s) => s.reportStatus === "Overdue" || s.reportStatus === "Pending" || s.remitStatus === "Outstanding",
  ).length;

  const columns: Column<ComplianceSnapshot>[] = [
    {
      key: "branch",
      header: "Branch",
      sortable: true,
      cell: (s) => <span className="font-medium">{branchName(s.branchId)}</span>,
    },
    {
      key: "state",
      header: "State",
      cell: (s) => <span className="text-[--text-muted]">{stateName(findBranch(s.branchId)?.stateId)}</span>,
    },
    {
      key: "reportStatus",
      header: "Report",
      cell: (s) => <StatusBadge status={s.reportStatus} />,
    },
    {
      key: "reportDue",
      header: "Report Due",
      cell: (s) => <span className="font-mono text-xs">{formatDate(s.reportDue)}</span>,
    },
    {
      key: "remitStatus",
      header: "Remittance",
      cell: (s) => <StatusBadge status={s.remitStatus} />,
    },
    {
      key: "remitDue",
      header: "Remit Due",
      cell: (s) => <span className="font-mono text-xs">{formatDate(s.remitDue)}</span>,
    },
  ];

  return (
    <>
      <PageHeader
        title="Compliance Tracker"
        description="April 2025 reporting and remittance compliance across branches."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={FileBarChart} label="Reports Submitted" value={`${reportCompliant}/${snapshots.length}`} iconTone="success" />
        <StatCard icon={Wallet} label="Remit Compliant" value={`${remitCompliant}/${snapshots.length}`} iconTone="gold" />
        <StatCard icon={ShieldCheck} label="At Risk" value={atRisk} iconTone="error" />
      </div>

      {(role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStateFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              stateFilter === "all"
                ? "bg-[--accent-primary] text-white border-[--accent-primary]"
                : "bg-[--bg-surface] text-[--text-muted] border-[--border-default] hover:border-[--accent-primary]/40"
            }`}
          >
            All States
          </button>
          {states.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStateFilter(s.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                stateFilter === s.id
                  ? "bg-[--accent-primary] text-white border-[--accent-primary]"
                  : "bg-[--bg-surface] text-[--text-muted] border-[--border-default] hover:border-[--accent-primary]/40"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Compliance Heatmap</CardTitle>
            <p className="text-xs text-[--text-muted] mt-0.5">
              {stateFilter === "all" ? "All visible branches" : `${stateName(stateFilter)} State`}
            </p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {(stateFilter === "all" ? states : states.filter((s) => s.id === stateFilter)).map((s) => {
              const stSnapshots = snapshots.filter((c) => findBranch(c.branchId)?.stateId === s.id);
              if (stSnapshots.length === 0) return null;
              return (
                <div key={s.id} className="flex items-start gap-3">
                  <div className="w-28 text-xs font-semibold text-[--text-muted] shrink-0 pt-1">{s.name}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {stSnapshots.map((c) => {
                      const worst =
                        c.reportStatus === "Overdue" || c.remitStatus === "Outstanding"
                          ? "Overdue"
                          : c.reportStatus === "Pending" || c.remitStatus === "Partial"
                            ? "Pending"
                            : "Compliant";
                      return (
                        <div
                          key={c.branchId}
                          title={`${branchName(c.branchId)}\nReport: ${c.reportStatus}\nRemit: ${c.remitStatus}`}
                          className={`h-8 w-8 rounded-md ${statusColor(worst)} hover:ring-2 hover:ring-[--accent-primary] cursor-pointer transition-shadow`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[--state-success]" /> Compliant</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[--state-warning]" /> Pending / Partial</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[--state-error]" /> Overdue / Outstanding</span>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>Branch Detail</CardTitle></CardHeader>
        <div className="px-1 pb-1">
          <DataTable columns={columns} data={snapshots} keyFn={(s) => s.branchId} />
        </div>
      </Card>
    </>
  );
}
