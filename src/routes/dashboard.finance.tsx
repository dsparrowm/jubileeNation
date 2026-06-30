import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Wallet, X } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { remittanceByStateCurrent } from "@/lib/data/seed";
import { filterRemittances, filterBranches } from "@/lib/data/filters";
import { useRole } from "@/lib/role-context";
import { useMockStore } from "@/lib/data/mock-store";
import type { Branch } from "@/lib/data/types";
import { branches, branchName, stateName } from "@/lib/data/seed";
import { naira, formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/finance")({ component: FinancePage });

function FinancePage() {
  const { role, user } = useRole();
  const { remittances, recordRemittance } = useMockStore();
  const [showModal, setShowModal] = React.useState(false);
  const [recordBranchId, setRecordBranchId] = React.useState<string | null>(null);
  const scoped = filterRemittances({ role, user }, remittances, branches);
  const stateBranches = filterBranches({ role, user }, branches);
  const april = scoped.filter(r => r.period === "Apr 2025");
  const expected = april.reduce((s, r) => s + r.expected, 0);
  const received = april.reduce((s, r) => s + r.received, 0);

  const chartData =
    role === "STATE_PASTOR"
      ? april.map((r) => ({
          branch: branchName(r.branchId).split(" ").slice(0, 2).join(" "),
          expected: r.expected,
          received: r.received,
        }))
      : remittanceByStateCurrent();

  const chartTitle =
    role === "STATE_PASTOR"
      ? `Remittance by Branch · April 2025`
      : "Remittance by State · April 2025";

  const chartXKey = role === "STATE_PASTOR" ? "branch" : "state";

  const canRecord = role === "STATE_PASTOR" || role === "HQ_ADMIN";

  const openRecord = (branchId?: string) => {
    setRecordBranchId(branchId ?? stateBranches[0]?.id ?? null);
    setShowModal(true);
  };

  return (
    <>
      <PageHeader
        title="Finance & Remittance"
        description={
          role === "STATE_PASTOR"
            ? "Branch remittance compliance and payment history for your state."
            : "Branch remittance compliance and payment history."
        }
        actions={
          canRecord ? (
            <Button
              className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
              size="sm"
              onClick={() => openRecord()}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Record Payment
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Wallet} label="Total Expected (April)" value={naira(expected)} iconTone="navy" />
        <StatCard icon={Wallet} label="Total Received" value={naira(received)} iconTone="success" />
        <StatCard icon={Wallet} label="Outstanding Balance" value={naira(expected - received)} iconTone="error" />
      </div>

      <Card className="mt-4">
        <CardHeader><div><CardTitle>{chartTitle}</CardTitle></div></CardHeader>
        <CardBody>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey={chartXKey} stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => naira(v)} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="expected" fill="#E5E9F2" name="Expected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="received" fill="#C9A050" name="Received" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader><div><CardTitle>Branch Remittance · April 2025</CardTitle></div></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Branch</th>
                <th className="text-left px-3 py-3 font-medium">State</th>
                <th className="text-right px-3 py-3 font-medium">Expected</th>
                <th className="text-right px-3 py-3 font-medium">Submitted</th>
                <th className="text-right px-3 py-3 font-medium">Balance</th>
                <th className="text-left px-3 py-3 font-medium">Status</th>
                <th className="text-left px-3 py-3 font-medium">Date</th>
                <th className="text-right px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-default]">
              {april.slice(0, 30).map(r => (
                <tr key={r.id} className="hover:bg-[--bg-base]/50">
                  <td className="px-5 py-3 font-medium">{branchName(r.branchId)}</td>
                  <td className="px-3 py-3 text-[--text-muted]">{stateName(branches.find(b => b.id === r.branchId)?.stateId)}</td>
                  <td className="px-3 py-3 text-right font-mono">{naira(r.expected)}</td>
                  <td className="px-3 py-3 text-right font-mono">{naira(r.received)}</td>
                  <td className="px-3 py-3 text-right font-mono">{naira(r.expected - r.received)}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-3 font-mono text-xs">{r.paidAt ? formatDate(r.paidAt) : "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {canRecord && (
                      <button
                        type="button"
                        className="text-xs text-[--accent-primary] font-medium"
                        onClick={() => openRecord(r.branchId)}
                      >
                        Record
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && recordBranchId && (
        <RecordPaymentModal
          branchId={recordBranchId}
          branches={stateBranches}
          onBranchChange={setRecordBranchId}
          onClose={() => setShowModal(false)}
          onSubmit={(amount, reference, method) => {
            recordRemittance(recordBranchId, amount, reference, method, user.id);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

function RecordPaymentModal({
  branchId,
  branches: branchList,
  onBranchChange,
  onClose,
  onSubmit,
}: {
  branchId: string;
  branches: Branch[];
  onBranchChange: (id: string) => void;
  onClose: () => void;
  onSubmit: (amount: number, reference: string, method: "Bank Transfer" | "Cash") => void;
}) {
  const [amount, setAmount] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [method, setMethod] = React.useState<"Bank Transfer" | "Cash">("Bank Transfer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!parsed || parsed <= 0 || !reference.trim()) return;
    onSubmit(parsed, reference.trim(), method);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--border-default]">
          <h2 className="text-base font-semibold">Record Payment</h2>
          <button type="button" onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Branch</label>
            <select
              value={branchId}
              onChange={(e) => onBranchChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
            >
              {branchList.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Amount (₦)</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm font-mono"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Reference</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              placeholder="Transaction reference"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as "Bank Transfer" | "Cash")}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
              Record Payment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
