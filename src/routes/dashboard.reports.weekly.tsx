import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { useMockStore } from "@/lib/data/mock-store";
import { useRole } from "@/lib/role-context";
import { filterWeeklyReports } from "@/lib/data/filters";
import { CURRENT_WEEK_ENDING } from "@/lib/data/seed";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/reports/weekly")({ component: WeeklyReportsPage });

function WeeklyReportsPage() {
  const { role, user } = useRole();
  const { weeklyReports, branches } = useMockStore();
  const ctx = { role, user };
  const scoped = filterWeeklyReports(ctx, weeklyReports, branches)
    .sort((a, b) => b.weekEnding.localeCompare(a.weekEnding));

  const currentWeek = scoped.find((w) => w.weekEnding === CURRENT_WEEK_ENDING);
  const canSubmitCurrent = currentWeek?.status === "Pending" || currentWeek?.status === "Overdue";

  return (
    <>
      <PageHeader
        title="Weekly Reports"
        description="Service-week reports for your branch. Submit one report per Sunday."
        actions={
          canSubmitCurrent ? (
            <Link to="/dashboard/reports/weekly/submit">
              <Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" size="sm">
                <Plus className="h-4 w-4 mr-1.5" /> Submit This Week
              </Button>
            </Link>
          ) : undefined
        }
      />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Week Ending</th>
                <th className="text-right px-3 py-3 font-medium">Attendance</th>
                <th className="text-right px-3 py-3 font-medium">Salvations</th>
                <th className="text-right px-3 py-3 font-medium">Baptisms</th>
                <th className="text-left px-3 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-default]">
              {scoped.map((w) => {
                const att = w.attendance.adults + w.attendance.youth + w.attendance.children;
                return (
                  <tr key={w.id} className="hover:bg-[--bg-base]/50">
                    <td className="px-5 py-3 font-medium">
                      {formatDate(w.weekEnding)}
                      {w.weekEnding === CURRENT_WEEK_ENDING && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-[--accent-primary] font-semibold">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-mono">{att}</td>
                    <td className="px-3 py-3 text-right font-mono">{w.salvations}</td>
                    <td className="px-3 py-3 text-right font-mono">{w.baptisms}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="px-5 py-3 text-[--text-muted] text-xs">
                      {w.submittedAt ? formatDate(w.submittedAt.slice(0, 10)) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {scoped.length === 0 && (
            <EmptyState
              icon={ClipboardList}
              title="No weekly reports"
              description="Submit your first weekly report to get started."
              action={{ label: "Submit Report", href: "/dashboard/reports/weekly/submit" }}
            />
          )}
        </div>
      </Card>
    </>
  );
}
