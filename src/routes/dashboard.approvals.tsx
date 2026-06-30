import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ClipboardCheck, FileBarChart, CalendarOff, ArrowLeftRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { useMockStore } from "@/lib/data/mock-store";
import { useRole } from "@/lib/role-context";
import {
  filterTransfersByState,
  filterLeaveByState,
  filterReports,
} from "@/lib/data/filters";
import {
  pastorName,
  branchName,
  findPastor,
  findBranch,
  branches,
} from "@/lib/data/seed";
import { formatDate, initials, daysBetween } from "@/lib/format";

export const Route = createFileRoute("/dashboard/approvals")({ component: ApprovalsPage });

function ApprovalsPage() {
  const { role, user } = useRole();
  const ctx = { role, user };
  const {
    transfers,
    leaveRequests,
    reports,
    approveTransfer,
    rejectTransfer,
    approveLeave,
    rejectLeave,
    approveReport,
  } = useMockStore();

  const pendingTransfers = filterTransfersByState(
    ctx,
    transfers.filter((t) => t.status === "Pending"),
    (bid) => findBranch(bid)?.stateId,
  );
  const pendingLeave = filterLeaveByState(
    ctx,
    leaveRequests.filter((l) => l.status === "Pending"),
    (pid) => findPastor(pid)?.stateId,
  );
  const overdueReports = filterReports(
    ctx,
    reports.filter(
      (r) => r.period === "Apr 2025" && (r.status === "Overdue" || r.status === "Pending"),
    ),
    branches,
  );
  const totalPending = pendingTransfers.length + pendingLeave.length + overdueReports.length;

  const description =
    role === "STATE_PASTOR"
      ? "Pending approvals for your state — transfers, leave, and overdue branch reports."
      : "Unified queue for transfers, leave requests, and overdue branch reports.";

  const handleApproveReport = (id: string) => approveReport(id, user.id);
  const handleApproveTransfer = (id: string) => approveTransfer(id, user.id);
  const handleRejectTransfer = (id: string) => rejectTransfer(id, user.id);
  const handleApproveLeave = (id: string) => approveLeave(id, user.id);
  const handleRejectLeave = (id: string) => rejectLeave(id, user.id);

  return (
    <>
      <PageHeader
        title="Approval Center"
        description={description}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={ClipboardCheck} label="Total Pending" value={totalPending} iconTone="gold" />
        <StatCard icon={ArrowLeftRight} label="Transfers" value={pendingTransfers.length} iconTone="navy" />
        <StatCard icon={CalendarOff} label="Leave" value={pendingLeave.length} iconTone="warning" />
        <StatCard icon={FileBarChart} label="Reports" value={overdueReports.length} iconTone="error" />
      </div>

      <Tabs defaultValue="all" className="mt-4">
        <TabsList className="bg-[--bg-surface] border border-[--border-default]">
          <TabsTrigger value="all">
            All <span className="ml-1.5 font-mono text-[11px] text-[--state-warning]">({totalPending})</span>
          </TabsTrigger>
          <TabsTrigger value="transfers">Transfers ({pendingTransfers.length})</TabsTrigger>
          <TabsTrigger value="leave">Leave ({pendingLeave.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports ({overdueReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {totalPending === 0 ? (
            <Card>
              <EmptyState
                icon={ClipboardCheck}
                title="All caught up"
                description="There are no pending approvals at this time."
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingTransfers.map((t) => (
                <TransferCard
                  key={t.id}
                  transfer={t}
                  onApprove={() => handleApproveTransfer(t.id)}
                  onReject={() => handleRejectTransfer(t.id)}
                />
              ))}
              {pendingLeave.map((l) => (
                <LeaveCard
                  key={l.id}
                  leave={l}
                  onApprove={() => handleApproveLeave(l.id)}
                  onReject={() => handleRejectLeave(l.id)}
                />
              ))}
              {overdueReports.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  onApprove={() => handleApproveReport(r.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transfers">
          {pendingTransfers.length === 0 ? (
            <Card><EmptyState icon={ArrowLeftRight} title="No pending transfers" /></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingTransfers.map((t) => (
                <TransferCard
                  key={t.id}
                  transfer={t}
                  onApprove={() => handleApproveTransfer(t.id)}
                  onReject={() => handleRejectTransfer(t.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leave">
          {pendingLeave.length === 0 ? (
            <Card><EmptyState icon={CalendarOff} title="No pending leave requests" /></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingLeave.map((l) => (
                <LeaveCard
                  key={l.id}
                  leave={l}
                  onApprove={() => handleApproveLeave(l.id)}
                  onReject={() => handleRejectLeave(l.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports">
          {overdueReports.length === 0 ? (
            <Card><EmptyState icon={FileBarChart} title="No overdue reports" /></Card>
          ) : (
            <div className="space-y-3">
              {overdueReports.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  onApprove={() => handleApproveReport(r.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function TransferCard({
  transfer: t,
  onApprove,
  onReject,
}: {
  transfer: (typeof import("@/lib/data/seed").transfers)[0];
  onApprove: () => void;
  onReject: () => void;
}) {
  const p = findPastor(t.pastorId)!;
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-sm font-semibold">
            {initials(p.firstName, p.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[--accent-primary]">Transfer</span>
              <StatusBadge status="Pending" />
            </div>
            <div className="font-semibold mt-1">{p.firstName} {p.lastName}</div>
            <div className="text-xs text-[--text-muted]">{p.rank}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm rounded-md bg-[--bg-base] px-3 py-2.5">
          <span className="text-[--text-muted] truncate flex-1">{branchName(t.fromBranchId)}</span>
          <ArrowRight className="h-3.5 w-3.5 text-[--accent-primary] shrink-0" />
          <span className="font-medium truncate flex-1 text-right">{branchName(t.toBranchId)}</span>
        </div>
        <div className="mt-3 text-xs space-y-1">
          <div><span className="text-[--text-muted]">Reason: </span>{t.reason}</div>
          <div><span className="text-[--text-muted]">Effective </span><span className="font-mono">{formatDate(t.effectiveDate)}</span></div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={onApprove} className="!bg-[var(--state-success)] !text-white hover:!bg-green-700 flex-1">Approve</Button>
          <Button size="sm" variant="outline" onClick={onReject} className="flex-1 text-[--state-error] border-[--state-error]/30 hover:bg-red-50">Reject</Button>
        </div>
      </div>
    </Card>
  );
}

function LeaveCard({
  leave: l,
  onApprove,
  onReject,
}: {
  leave: (typeof import("@/lib/data/seed").leaveRequests)[0];
  onApprove: () => void;
  onReject: () => void;
}) {
  const p = findPastor(l.pastorId)!;
  return (
    <Card>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[--state-warning]">Leave</span>
            <div className="font-semibold mt-1">{pastorName(l.pastorId)}</div>
            <div className="text-xs text-[--text-muted]">{branchName(p.branchId)} · {l.type}</div>
          </div>
          <StatusBadge status="Pending" />
        </div>
        <div className="mt-3 text-xs space-y-1">
          <div className="font-mono">{formatDate(l.fromDate)} → {formatDate(l.toDate)} ({daysBetween(l.fromDate, l.toDate)} days)</div>
          <div><span className="text-[--text-muted]">Reason: </span>{l.reason}</div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={onApprove} className="!bg-[var(--state-success)] !text-white hover:!bg-green-700 flex-1">Approve</Button>
          <Button size="sm" variant="outline" onClick={onReject} className="flex-1 text-[--state-error] border-[--state-error]/30 hover:bg-red-50">Reject</Button>
        </div>
      </div>
    </Card>
  );
}

function ReportCard({
  report: r,
  onApprove,
}: {
  report: (typeof import("@/lib/data/seed").reports)[0];
  onApprove: () => void;
}) {
  const br = findBranch(r.branchId);
  return (
    <Card>
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[--state-error]">Report</span>
          <div className="font-semibold mt-1">{branchName(r.branchId)}</div>
          <div className="text-xs text-[--text-muted]">{r.period} · {br?.name}</div>
        </div>
        <StatusBadge status={r.status} />
        <Button size="sm" onClick={onApprove} className="!bg-[var(--state-success)] !text-white hover:!bg-green-700 shrink-0">
          Mark Approved
        </Button>
      </div>
    </Card>
  );
}
