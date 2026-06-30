import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { useMockStore } from "@/lib/data/mock-store";
import { useRole } from "@/lib/role-context";
import { CURRENT_WEEK_ENDING } from "@/lib/data/seed";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/reports/weekly/submit")({
  component: SubmitWeeklyReportPage,
});

function SubmitWeeklyReportPage() {
  const { user } = useRole();
  const { submitWeeklyReport } = useMockStore();
  const [done, setDone] = React.useState(false);

  if (done) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-[--state-success]">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Weekly Report Submitted</h2>
        <p className="mt-2 text-sm text-[--text-muted]">
          Your report for the week ending {formatDate(CURRENT_WEEK_ENDING)} has been recorded.
        </p>
        <Link to="/dashboard/reports/weekly">
          <Button className="mt-6 !bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
            View Weekly Reports
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        to="/dashboard/reports/weekly"
        className="inline-flex items-center gap-1 text-sm text-[--text-muted] hover:text-[--text-primary] mb-3"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <PageHeader
        title="Submit Weekly Report"
        description={`Week ending ${formatDate(CURRENT_WEEK_ENDING)} — branch service metrics.`}
      />
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            if (!user.branchId) return;
            submitWeeklyReport(user.branchId, user.id, CURRENT_WEEK_ENDING, {
              attendance: {
                adults: Number(fd.get("adults") || 0),
                youth: Number(fd.get("youth") || 0),
                children: Number(fd.get("children") || 0),
              },
              salvations: Number(fd.get("salvations") || 0),
              baptisms: Number(fd.get("baptisms") || 0),
              dedications: Number(fd.get("dedications") || 0),
              cellGroups: {
                count: Number(fd.get("cellCount") || 0),
                attendance: Number(fd.get("cellAttendance") || 0),
              },
              notes: String(fd.get("notes") || ""),
            });
            setDone(true);
          }}
        >
          <CardBody className="space-y-6 max-w-3xl">
            <Section title="Attendance">
              <div className="grid grid-cols-3 gap-3">
                <NumField name="adults" label="Adults" />
                <NumField name="youth" label="Youth" />
                <NumField name="children" label="Children" />
              </div>
            </Section>
            <Section title="Conversions">
              <div className="grid grid-cols-3 gap-3">
                <NumField name="salvations" label="Salvations" />
                <NumField name="baptisms" label="Baptisms" />
                <NumField name="dedications" label="Dedications" />
              </div>
            </Section>
            <Section title="Cell Groups">
              <div className="grid grid-cols-2 gap-3">
                <NumField name="cellCount" label="Number of Cell Groups" />
                <NumField name="cellAttendance" label="Cell Group Attendance" />
              </div>
            </Section>
            <Section title="Notes">
              <textarea
                name="notes"
                rows={4}
                className="w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
                placeholder="Brief commentary for this week..."
              />
            </Section>
            <div className="flex justify-end gap-2 pt-2 border-t border-[--border-default]">
              <Link to="/dashboard/reports/weekly">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
              >
                Submit Report
              </Button>
            </div>
          </CardBody>
        </form>
      </Card>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function NumField({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        type="number"
        min={0}
        defaultValue={0}
        className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm font-mono"
      />
    </div>
  );
}
