import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, FileBarChart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { StatCard } from "@/components/ui-kit/stat-card";
import { useMockStore } from "@/lib/data/mock-store";
import { useRole } from "@/lib/role-context";
import { filterMonthlySummaries } from "@/lib/data/filters";
import { CURRENT_MONTH } from "@/lib/data/seed";
import { formatDate, naira } from "@/lib/format";

export const Route = createFileRoute("/dashboard/reports/monthly")({ component: MonthlySummaryPage });

function MonthlySummaryPage() {
  const { role, user } = useRole();
  const { monthlySummaries, branches, submitMonthlySummary } = useMockStore();
  const ctx = { role, user };
  const summary = filterMonthlySummaries(ctx, monthlySummaries, branches).find(
    (m) => m.period === CURRENT_MONTH,
  );
  const [done, setDone] = React.useState(false);
  const [offering, setOffering] = React.useState(summary?.offering?.toString() ?? "");
  const [notes, setNotes] = React.useState(summary?.notes ?? "");

  if (!summary) {
    return (
      <PageHeader title="Monthly Summary" description="No summary available for the current period." />
    );
  }

  const totalAttendance =
    summary.totals.attendance.adults +
    summary.totals.attendance.youth +
    summary.totals.attendance.children;

  const isSubmitted = summary.status === "Submitted" || summary.status === "Approved";

  if (done) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-[--state-success]">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Monthly Summary Submitted</h2>
        <p className="mt-2 text-sm text-[--text-muted]">
          Your {CURRENT_MONTH} summary has been sent to the state office for review.
        </p>
        <Link to="/dashboard">
          <Button className="mt-6 !bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
            Back to Overview
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Monthly Summary"
        description={`${CURRENT_MONTH} — review aggregated weekly data and submit your month-end summary.`}
        actions={
          isSubmitted ? (
            <StatusBadge status={summary.status} />
          ) : (
            <span className="text-xs text-[--text-muted]">
              {summary.weeksSubmitted} of {summary.weeksExpected} weekly reports submitted
            </span>
          )
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <StatCard icon={FileBarChart} label="Total Attendance" value={totalAttendance} iconTone="gold" />
        <StatCard icon={FileBarChart} label="Salvations" value={summary.totals.salvations} iconTone="info" />
        <StatCard icon={FileBarChart} label="Baptisms" value={summary.totals.baptisms} iconTone="navy" />
        <StatCard
          icon={FileBarChart}
          label="Weeks Reported"
          value={`${summary.weeksSubmitted}/${summary.weeksExpected}`}
          iconTone="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Aggregated from Weekly Reports</CardTitle>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Agg label="Adults" value={summary.totals.attendance.adults} />
              <Agg label="Youth" value={summary.totals.attendance.youth} />
              <Agg label="Children" value={summary.totals.attendance.children} />
              <Agg label="Dedications" value={summary.totals.dedications} />
            </dl>
            <p className="text-xs text-[--text-muted] mt-4">
              Totals are auto-calculated from submitted weekly reports. Complete all weekly reports before
              submitting the monthly summary.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isSubmitted ? "Submitted Summary" : "Submit Month-End Summary"}</CardTitle>
          </CardHeader>
          <CardBody>
            {isSubmitted ? (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-[--text-muted]">Total Offering</div>
                  <div className="font-mono font-semibold mt-0.5">{naira(summary.offering)}</div>
                </div>
                {summary.notes && (
                  <div>
                    <div className="text-xs text-[--text-muted]">Pastoral Notes</div>
                    <p className="mt-0.5">{summary.notes}</p>
                  </div>
                )}
                <div className="text-xs text-[--text-muted]">
                  Submitted {summary.submittedAt ? formatDate(summary.submittedAt.slice(0, 10)) : "—"}
                </div>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!user.branchId) return;
                  submitMonthlySummary(
                    user.branchId,
                    user.id,
                    CURRENT_MONTH,
                    Number(offering) || 0,
                    notes,
                  );
                  setDone(true);
                }}
              >
                <div>
                  <label className="text-sm font-medium">Total Offering (₦)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={offering}
                    onChange={(e) => setOffering(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Pastoral Notes</label>
                  <textarea
                    rows={5}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
                    placeholder="Month-end commentary, prayer points, notable updates..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-[--border-default]">
                  <Link to="/dashboard/reports/weekly">
                    <Button type="button" variant="outline">
                      View Weekly Reports
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={summary.weeksSubmitted === 0}
                    className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
                  >
                    Submit Monthly Summary
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Agg({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[--border-default] p-3">
      <dt className="text-xs text-[--text-muted]">{label}</dt>
      <dd className="font-mono text-lg font-bold mt-0.5">{value}</dd>
    </div>
  );
}
