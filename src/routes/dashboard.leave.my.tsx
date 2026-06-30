import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, CalendarOff } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { useMockStore } from "@/lib/data/mock-store";
import { filterLeaveByState } from "@/lib/data/filters";
import { useRole } from "@/lib/role-context";
import { findPastor } from "@/lib/data/seed";
import { formatDate, daysBetween } from "@/lib/format";

export const Route = createFileRoute("/dashboard/leave/my")({ component: MyLeavePage });

const leaveTypeColor: Record<string, string> = {
  Annual: "bg-[--state-info]",
  Medical: "bg-[--state-error]",
  Compassionate: "bg-[--state-warning]",
  Sabbatical: "bg-purple-600",
};

function MyLeavePage() {
  const { role, user } = useRole();
  const { leaveRequests } = useMockStore();
  const scoped = filterLeaveByState(
    { role, user },
    leaveRequests,
    (pid) => findPastor(pid)?.stateId,
  ).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));

  const pending = scoped.filter((l) => l.status === "Pending").length;

  return (
    <>
      <PageHeader
        title="My Leave"
        description="Track your leave applications and their approval status."
        actions={
          <Link to="/dashboard/leave/apply">
            <Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Apply for Leave
            </Button>
          </Link>
        }
      />

      {pending > 0 && (
        <div className="mb-4 rounded-lg border border-[--state-warning]/30 bg-[--state-warning]/5 px-4 py-3 text-sm">
          You have <strong>{pending}</strong> leave request{pending > 1 ? "s" : ""} awaiting approval.
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-3 py-3 font-medium">From</th>
                <th className="text-left px-3 py-3 font-medium">To</th>
                <th className="text-right px-3 py-3 font-medium">Days</th>
                <th className="text-left px-3 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-default]">
              {scoped.map((l) => (
                <tr key={l.id} className="hover:bg-[--bg-base]/50">
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span className={`h-2 w-2 rounded-full ${leaveTypeColor[l.type]}`} />
                      {l.type}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs">{formatDate(l.fromDate)}</td>
                  <td className="px-3 py-3 font-mono text-xs">{formatDate(l.toDate)}</td>
                  <td className="px-3 py-3 text-right font-mono">{daysBetween(l.fromDate, l.toDate)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-5 py-3 text-xs text-[--text-muted]">
                    {formatDate(l.appliedAt.slice(0, 10))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {scoped.length === 0 && (
            <EmptyState
              icon={CalendarOff}
              title="No leave applications"
              description="You haven't applied for leave yet."
              action={{ label: "Apply for Leave", href: "/dashboard/leave/apply" }}
            />
          )}
        </div>
      </Card>
    </>
  );
}
