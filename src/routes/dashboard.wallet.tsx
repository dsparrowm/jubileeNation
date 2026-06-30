import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Upload, Wallet, X, Download, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { useRole } from "@/lib/role-context";
import { useMockStore } from "@/lib/data/mock-store";
import { filterOrgWalletTransactions } from "@/lib/data/filters";
import { ORG_WALLET_ID } from "@/lib/data/seed";
import { naira, formatDate } from "@/lib/format";
import { parsePayrollCsv, PAYROLL_CSV_TEMPLATE } from "@/lib/wallet/parse-payroll-csv";
import type { PayrollLine } from "@/lib/data/types";

export const Route = createFileRoute("/dashboard/wallet")({ component: WalletAdminPage });

function WalletAdminPage() {
  const { user } = useRole();
  const {
    orgWallet,
    walletAccounts,
    walletTransactions,
    payrollRuns,
    topUpOrgWallet,
    createPayrollDraft,
    processPayrollRun,
  } = useMockStore();

  const [showTopUp, setShowTopUp] = React.useState(false);
  const [csvPreview, setCsvPreview] = React.useState<{
    fileName: string;
    period: string;
    lines: PayrollLine[];
    errors: string[];
  } | null>(null);

  const orgTxs = filterOrgWalletTransactions(walletTransactions, ORG_WALLET_ID);
  const employeeWallets = walletAccounts.filter((w) => w.ownerType !== "org");
  const dvaCount = employeeWallets.filter((w) => w.paystackDva).length;
  const disbursedThisMonth = walletTransactions
    .filter((t) => t.type === "payroll_debit" && t.at.startsWith("2025-06"))
    .reduce((s, t) => s + t.amount, 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const { lines, errors } = parsePayrollCsv(text);
      const periodMatch = file.name.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-_\s]?(\d{4})/i);
      const period = periodMatch
        ? `${periodMatch[1].charAt(0).toUpperCase()}${periodMatch[1].slice(1).toLowerCase()} ${periodMatch[2]}`
        : "Jun 2025";
      setCsvPreview({ fileName: file.name, period, lines, errors });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const validPreviewLines = csvPreview?.lines.filter((l) => !l.error && l.amount > 0) ?? [];
  const previewTotal = validPreviewLines.reduce((s, l) => s + l.amount, 0);
  const canProcess =
    csvPreview &&
    validPreviewLines.length > 0 &&
    previewTotal <= orgWallet.balance &&
    csvPreview.lines.every((l) => !l.error);

  const handleProcessPayroll = () => {
    if (!csvPreview || !canProcess) return;
    const runId = createPayrollDraft(csvPreview.fileName, csvPreview.period, csvPreview.lines, user.id);
    processPayrollRun(runId, user.id);
    setCsvPreview(null);
  };

  const downloadTemplate = () => {
    const blob = new Blob([PAYROLL_CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payroll-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Payroll Wallet"
        description="HQ payroll funding and bulk salary disbursement via Paystack DVA."
        actions={
          <Button
            className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
            size="sm"
            onClick={() => setShowTopUp(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Top Up Wallet
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Wallet} label="HQ Wallet Balance" value={naira(orgWallet.balance)} iconTone="navy" />
        <StatCard icon={CreditCard} label="Active Paystack DVAs" value={String(dvaCount)} iconTone="success" />
        <StatCard icon={Wallet} label="Disbursed (Jun 2025)" value={naira(disbursedThisMonth)} iconTone="success" />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Bulk Payroll Upload</CardTitle>
            <Button size="sm" variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-1.5" /> CSV Template
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-[--text-muted]">
            Salaries are credited to each employee&apos;s Paystack DVA wallet. Staff withdraw instantly to their linked bank — no admin approval required.
          </p>
          <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[--border-default] p-8 cursor-pointer hover:bg-[--bg-base]/50 transition-colors">
            <Upload className="h-8 w-8 text-[--text-muted]" />
            <span className="text-sm font-medium">Upload salary CSV</span>
            <span className="text-xs text-[--text-muted]">Columns: person_type, person_id, amount</span>
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
          </label>

          {csvPreview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Preview — {csvPreview.fileName} · {csvPreview.period}
                </p>
                <button type="button" onClick={() => setCsvPreview(null)} className="text-[--text-muted] hover:text-[--text-primary]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              {csvPreview.errors.length > 0 && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-xs text-red-700 space-y-1">
                  {csvPreview.errors.map((err) => (
                    <p key={err}>{err}</p>
                  ))}
                </div>
              )}
              <div className="overflow-x-auto rounded-lg border border-[--border-default]">
                <table className="w-full text-sm">
                  <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Name</th>
                      <th className="text-left px-3 py-2 font-medium">Type</th>
                      <th className="text-left px-3 py-2 font-medium">ID</th>
                      <th className="text-right px-3 py-2 font-medium">Amount</th>
                      <th className="text-left px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[--border-default]">
                    {csvPreview.lines.map((line, i) => (
                      <tr key={`${line.personId}-${i}`}>
                        <td className="px-4 py-2 font-medium">{line.name}</td>
                        <td className="px-3 py-2 capitalize text-[--text-muted]">{line.personType}</td>
                        <td className="px-3 py-2 font-mono text-xs">{line.personId}</td>
                        <td className="px-3 py-2 text-right font-mono">{naira(line.amount)}</td>
                        <td className="px-4 py-2">
                          {line.error ? (
                            <span className="text-xs text-red-600">{line.error}</span>
                          ) : (
                            <StatusBadge status="Pending" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[--bg-base] font-medium">
                      <td colSpan={3} className="px-4 py-2 text-right text-xs">Total (valid rows)</td>
                      <td className="px-3 py-2 text-right font-mono">{naira(previewTotal)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
              {previewTotal > orgWallet.balance && (
                <p className="text-xs text-red-600">Insufficient HQ balance for this payroll ({naira(previewTotal)} required).</p>
              )}
              <div className="flex justify-end">
                <Button
                  className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
                  disabled={!canProcess}
                  onClick={handleProcessPayroll}
                >
                  Confirm &amp; Disburse Salaries
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>Payroll Runs</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Period</th>
                <th className="text-left px-3 py-3 font-medium">File</th>
                <th className="text-right px-3 py-3 font-medium">Recipients</th>
                <th className="text-right px-3 py-3 font-medium">Total</th>
                <th className="text-left px-3 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-default]">
              {payrollRuns.map((run) => (
                <tr key={run.id} className="hover:bg-[--bg-base]/50">
                  <td className="px-5 py-3 font-medium">{run.period}</td>
                  <td className="px-3 py-3 text-[--text-muted]">{run.fileName}</td>
                  <td className="px-3 py-3 text-right">{run.lineCount}</td>
                  <td className="px-3 py-3 text-right font-mono">{naira(run.totalAmount)}</td>
                  <td className="px-3 py-3"><StatusBadge status={run.status} /></td>
                  <td className="px-5 py-3 text-xs text-[--text-muted]">{formatDate(run.uploadedAt.slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>HQ Wallet Ledger</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Description</th>
                <th className="text-left px-3 py-3 font-medium">Type</th>
                <th className="text-right px-3 py-3 font-medium">Amount</th>
                <th className="text-right px-3 py-3 font-medium">Balance After</th>
                <th className="text-left px-3 py-3 font-medium">Reference</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-default]">
              {orgTxs.map((tx) => (
                <tr key={tx.id} className="hover:bg-[--bg-base]/50">
                  <td className="px-5 py-3">{tx.description}</td>
                  <td className="px-3 py-3 capitalize text-[--text-muted]">{tx.type.replace("_", " ")}</td>
                  <td className={`px-3 py-3 text-right font-mono ${tx.type === "top_up" ? "text-green-700" : "text-red-700"}`}>
                    {tx.type === "top_up" ? "+" : "−"}{naira(tx.amount)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">{naira(tx.balanceAfter)}</td>
                  <td className="px-3 py-3 font-mono text-xs">{tx.reference}</td>
                  <td className="px-5 py-3 text-xs text-[--text-muted]">{formatDate(tx.at.slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showTopUp && (
        <TopUpModal
          onClose={() => setShowTopUp(false)}
          onSubmit={(amount, reference) => {
            topUpOrgWallet(amount, reference, user.id);
            setShowTopUp(false);
          }}
        />
      )}
    </>
  );
}

function TopUpModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (amount: number, reference: string) => void;
}) {
  const [amount, setAmount] = React.useState("");
  const [reference, setReference] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!parsed || parsed <= 0 || !reference.trim()) return;
    onSubmit(parsed, reference.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--border-default]">
          <h2 className="text-base font-semibold">Top Up HQ Wallet</h2>
          <button type="button" onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Amount (₦)</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Reference</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. TXN-2025-003"
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
              Top Up
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
