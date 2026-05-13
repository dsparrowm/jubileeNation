import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { reports, branches, states, stateName, branchName, pastorName } from "@/lib/data/seed";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/reports/")({ component: ReportsPage });

function ReportsPage() {
  const aprilReports = reports.filter(r => r.period === "Apr 2025");
  const colorFor = (b: typeof branches[0]) => {
    const r = aprilReports.find(rp => rp.branchId === b.id);
    if (!r) return "bg-slate-200";
    if (r.status === "Overdue") return "bg-[--state-error]";
    if (r.status === "Pending") return "bg-[--state-warning]";
    if (r.status === "Approved") return "bg-[--state-success]";
    return "bg-[--state-success]/70";
  };

  return (
    <>
      <PageHeader title="Branch Reports" description="Monthly compliance grid and full submission archive."
        actions={<Link to="/dashboard/reports/submit"><Button className="bg-[--accent-primary] hover:bg-[--accent-hover] text-white" size="sm"><Plus className="h-4 w-4 mr-1.5" /> Submit Report</Button></Link>}
      />

      <Card>
        <CardHeader><div><CardTitle>Compliance Grid · April 2025</CardTitle><p className="text-xs text-[--text-muted] mt-0.5">Each cell represents one branch.</p></div></CardHeader>
        <div className="p-5">
          <div className="space-y-3">
            {states.map(s => {
              const stB = branches.filter(b => b.stateId === s.id);
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-28 text-xs font-medium text-[--text-muted] shrink-0">{s.name}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {stB.map(b => (
                      <div key={b.id} title={`${b.name} — ${aprilReports.find(r => r.branchId === b.id)?.status ?? "Unknown"}`} className={`h-7 w-7 rounded ${colorFor(b)} hover:ring-2 hover:ring-[--accent-primary] cursor-pointer`} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[--state-success]" /> Submitted / Approved</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[--state-warning]" /> Pending</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[--state-error]" /> Overdue</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-200" /> Not yet due</span>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader><div><CardTitle>All Submitted Reports</CardTitle></div></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Branch</th>
                <th className="text-left px-3 py-3 font-medium">State</th>
                <th className="text-left px-3 py-3 font-medium">Period</th>
                <th className="text-left px-3 py-3 font-medium">Submitted By</th>
                <th className="text-left px-3 py-3 font-medium">Submitted</th>
                <th className="text-right px-3 py-3 font-medium">Attendance</th>
                <th className="text-right px-3 py-3 font-medium">Salvations</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-default]">
              {reports.filter(r => r.submittedAt).slice(0, 30).map(r => (
                <tr key={r.id} className="hover:bg-[--bg-base]/50">
                  <td className="px-5 py-3 font-medium">{branchName(r.branchId)}</td>
                  <td className="px-3 py-3 text-[--text-muted]">{stateName(branches.find(b => b.id === r.branchId)?.stateId)}</td>
                  <td className="px-3 py-3 text-[--text-muted]">{r.period}</td>
                  <td className="px-3 py-3">{pastorName(r.submittedById)}</td>
                  <td className="px-3 py-3 font-mono text-xs">{formatDate(r.submittedAt)}</td>
                  <td className="px-3 py-3 text-right font-mono">{r.attendance.adults + r.attendance.youth + r.attendance.children}</td>
                  <td className="px-3 py-3 text-right font-mono">{r.salvations}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
