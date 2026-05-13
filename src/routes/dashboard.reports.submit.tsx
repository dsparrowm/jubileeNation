import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/reports/submit")({ component: SubmitReportPage });

function SubmitReportPage() {
  const [done, setDone] = React.useState(false);
  if (done) return (
    <div className="max-w-xl mx-auto py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-[--state-success]"><Check className="h-7 w-7" /></div>
      <h2 className="mt-4 text-xl font-bold">Report Submitted</h2>
      <p className="mt-2 text-sm text-[--text-muted]">Your monthly report has been recorded.</p>
      <Link to="/dashboard/reports"><Button className="mt-6 bg-[--accent-primary] hover:bg-[--accent-hover] text-white">View Reports</Button></Link>
    </div>
  );

  return (
    <>
      <Link to="/dashboard/reports" className="inline-flex items-center gap-1 text-sm text-[--text-muted] hover:text-[--text-primary] mb-3"><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>
      <PageHeader title="Submit Monthly Report" description="Branch metrics for the current reporting period." />
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
          <CardBody className="space-y-6 max-w-3xl">
            <Section title="Attendance">
              <div className="grid grid-cols-3 gap-3">
                <NumField label="Adults" />
                <NumField label="Youth" />
                <NumField label="Children" />
              </div>
            </Section>
            <Section title="Conversions">
              <div className="grid grid-cols-3 gap-3">
                <NumField label="Salvations" />
                <NumField label="Baptisms" />
                <NumField label="Dedications" />
              </div>
            </Section>
            <Section title="Cell Groups">
              <div className="grid grid-cols-2 gap-3">
                <NumField label="Number of Cell Groups" />
                <NumField label="Cell Group Attendance" />
              </div>
            </Section>
            <Section title="Offering Summary">
              <div>
                <label className="text-sm font-medium">Total Offering (₦)</label>
                <input type="number" className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm font-mono" />
              </div>
            </Section>
            <Section title="Pastoral Notes">
              <textarea rows={5} className="w-full rounded-md border border-[--border-default] px-3 py-2 text-sm" placeholder="Any commentary, prayer points, or notable updates..." />
            </Section>
            <div className="flex justify-end gap-2 pt-2 border-t border-[--border-default]">
              <Link to="/dashboard/reports"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" className="bg-[--accent-primary] hover:bg-[--accent-hover] text-white">Submit Report</Button>
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
      <h3 className="text-sm font-semibold mb-2.5">{title}</h3>
      {children}
    </div>
  );
}
function NumField({ label }: { label: string }) {
  return (
    <div>
      <label className="text-xs text-[--text-muted]">{label}</label>
      <input type="number" min={0} className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm font-mono" />
    </div>
  );
}
