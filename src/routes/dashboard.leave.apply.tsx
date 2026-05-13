import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Upload, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/leave/apply")({ component: LeaveApplyPage });

function LeaveApplyPage() {
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-[--state-success]">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Application Submitted</h2>
        <p className="mt-2 text-sm text-[--text-muted]">Your leave application is now under review. You will receive a notification once a decision is made.</p>
        <Link to="/dashboard/leave"><Button className="mt-6 !bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">Back to Leave</Button></Link>
      </div>
    );
  }

  return (
    <>
      <Link to="/dashboard/leave" className="inline-flex items-center gap-1 text-sm text-[--text-muted] hover:text-[--text-primary] mb-3">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <PageHeader title="Apply for Leave" description="Submit a new leave application." />
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          <CardBody className="space-y-4 max-w-2xl">
            <div>
              <label className="text-sm font-medium">Leave Type</label>
              <select className="mt-1.5 w-full rounded-md border border-[--border-default] bg-white px-3 py-2 text-sm">
                <option>Annual</option><option>Medical</option><option>Compassionate</option><option>Sabbatical</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">From</label>
                <input type="date" required className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">To</label>
                <input type="date" required className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Reason</label>
              <textarea rows={4} required className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm" placeholder="Briefly explain the reason for this leave..." />
            </div>
            <div>
              <label className="text-sm font-medium">Supporting Document</label>
              <div className="mt-1.5 rounded-md border border-dashed border-[--border-default] px-4 py-8 text-center">
                <Upload className="h-5 w-5 mx-auto text-[--text-muted]" />
                <div className="text-sm mt-2">Click to upload or drag and drop</div>
                <div className="text-xs text-[--text-muted] mt-1">PDF, JPG up to 5MB</div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[--border-default]">
              <Link to="/dashboard/leave"><Button type="button" variant="outline">Cancel</Button></Link>
              <Button type="submit" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">Submit Application</Button>
            </div>
          </CardBody>
        </form>
      </Card>
    </>
  );
}
