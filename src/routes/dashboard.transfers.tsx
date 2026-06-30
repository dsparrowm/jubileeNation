import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, ArrowRight, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMockStore } from "@/lib/data/mock-store";
import { filterTransfersByState, filterPastors, filterBranches } from "@/lib/data/filters";
import { useRole } from "@/lib/role-context";
import { pastorName, branchName, findPastor, findBranch, branches, pastors } from "@/lib/data/seed";
import { formatDate, initials } from "@/lib/format";

export const Route = createFileRoute("/dashboard/transfers")({ component: TransfersPage });

function TransfersPage() {
  const { role, user } = useRole();
  const ctx = { role, user };
  const { transfers, approveTransfer, rejectTransfer, initiateTransfer } = useMockStore();
  const [showModal, setShowModal] = React.useState(false);
  const scoped = filterTransfersByState(
    ctx,
    transfers,
    (bid) => findBranch(bid)?.stateId,
  );
  const pending = scoped.filter(t => t.status === "Pending");
  const all = scoped;

  const canInitiate = role === "STATE_PASTOR" || role === "HQ_ADMIN" || role === "GENERAL_OVERSEER";

  return (
    <>
      <PageHeader
        title="Transfers & Appointments"
        description={
          role === "STATE_PASTOR"
            ? "Initiate and approve pastoral transfers involving your state."
            : "Manage pastoral transfers across branches and states."
        }
        actions={
          canInitiate ? (
            <Button
              className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
              size="sm"
              onClick={() => setShowModal(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Initiate Transfer
            </Button>
          ) : undefined
        }
      />
      <Tabs defaultValue="all">
        <TabsList className="bg-[--bg-surface] border border-[--border-default]">
          <TabsTrigger value="all">All Transfers <span className="ml-1.5 font-mono text-[11px] text-[--text-muted]">({all.length})</span></TabsTrigger>
          <TabsTrigger value="pending">Pending Approval <span className="ml-1.5 font-mono text-[11px] text-[--state-warning]">({pending.length})</span></TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Pastor</th>
                    <th className="text-left px-3 py-3 font-medium">From</th>
                    <th className="text-left px-3 py-3 font-medium">To</th>
                    <th className="text-left px-3 py-3 font-medium">Effective</th>
                    <th className="text-left px-3 py-3 font-medium">Requested By</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border-default]">
                  {all.map(t => (
                    <tr key={t.id} className="hover:bg-[--bg-base]/50">
                      <td className="px-5 py-3 font-medium">{pastorName(t.pastorId)}</td>
                      <td className="px-3 py-3 text-[--text-muted]">{branchName(t.fromBranchId)}</td>
                      <td className="px-3 py-3">{branchName(t.toBranchId)}</td>
                      <td className="px-3 py-3 font-mono text-xs">{formatDate(t.effectiveDate)}</td>
                      <td className="px-3 py-3 text-[--text-muted]">{pastorName(t.requestedById)}</td>
                      <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pending.map(t => {
              const p = findPastor(t.pastorId)!;
              return (
                <Card key={t.id}>
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-sm font-semibold">{initials(p.firstName, p.lastName)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{p.firstName} {p.lastName}</div>
                        <div className="text-xs text-[--text-muted]">{p.rank}</div>
                      </div>
                      <StatusBadge status="Pending" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm rounded-md bg-[--bg-base] px-3 py-2.5">
                      <span className="text-[--text-muted] truncate flex-1">{branchName(t.fromBranchId)}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[--accent-primary] shrink-0" />
                      <span className="font-medium truncate flex-1 text-right">{branchName(t.toBranchId)}</span>
                    </div>
                    <div className="mt-3 text-xs">
                      <div><span className="text-[--text-muted]">Reason: </span>{t.reason}</div>
                      <div className="mt-1"><span className="text-[--text-muted]">Requested by </span>{pastorName(t.requestedById)} · <span className="font-mono">{formatDate(t.requestedAt)}</span></div>
                      <div className="mt-1"><span className="text-[--text-muted]">Effective </span><span className="font-mono">{formatDate(t.effectiveDate)}</span></div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="!bg-[var(--state-success)] !text-white hover:!bg-green-700 flex-1" onClick={() => approveTransfer(t.id, user.id)}>Approve</Button>
                      <Button size="sm" variant="outline" className="flex-1 text-[--state-error] border-[--state-error]/30 hover:bg-red-50" onClick={() => rejectTransfer(t.id, user.id)}>Reject</Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {showModal && (
        <InitiateTransferModal
          ctx={ctx}
          onClose={() => setShowModal(false)}
          onSubmit={(input) => {
            initiateTransfer({ ...input, requestedById: user.id });
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

function InitiateTransferModal({
  ctx,
  onClose,
  onSubmit,
}: {
  ctx: { role: import("@/lib/data/types").Role; user: import("@/lib/data/types").Pastor };
  onClose: () => void;
  onSubmit: (input: {
    pastorId: string;
    fromBranchId: string;
    toBranchId: string;
    effectiveDate: string;
    reason: string;
  }) => void;
}) {
  const statePastors = filterPastors(ctx, pastors).filter((p) => p.branchId);
  const stateBranches = filterBranches(ctx, branches);
  const allBranches = branches;

  const [pastorId, setPastorId] = React.useState(statePastors[0]?.id ?? "");
  const selectedPastor = pastors.find((p) => p.id === pastorId);
  const [fromBranchId, setFromBranchId] = React.useState(selectedPastor?.branchId ?? "");
  const [toBranchId, setToBranchId] = React.useState("");
  const [effectiveDate, setEffectiveDate] = React.useState("");
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (selectedPastor?.branchId) setFromBranchId(selectedPastor.branchId);
  }, [pastorId, selectedPastor?.branchId]);

  const toBranch = allBranches.find((b) => b.id === toBranchId);
  const isCrossState =
    toBranch && selectedPastor && toBranch.stateId !== selectedPastor.stateId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastorId || !fromBranchId || !toBranchId || !effectiveDate || !reason.trim()) return;
    onSubmit({ pastorId, fromBranchId, toBranchId, effectiveDate, reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--border-default]">
          <h2 className="text-base font-semibold">Initiate Transfer</h2>
          <button type="button" onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Pastor</label>
            <select
              value={pastorId}
              onChange={(e) => setPastorId(e.target.value)}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              required
            >
              {statePastors.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} · {p.rank}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted]">From Branch</label>
            <select
              value={fromBranchId}
              onChange={(e) => setFromBranchId(e.target.value)}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              required
            >
              {stateBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted]">To Branch</label>
            <select
              value={toBranchId}
              onChange={(e) => setToBranchId(e.target.value)}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              required
            >
              <option value="">Select destination branch</option>
              {allBranches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {isCrossState && (
              <p className="mt-1.5 text-xs text-[--state-warning]">
                Cross-state transfer — HQ co-approval may be required.
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Effective Date</label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              placeholder="Reason for transfer..."
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
              Submit Transfer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
