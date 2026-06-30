import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Wallet, ArrowDownToLine, X, Copy, Check, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/role-context";
import { useMockStore } from "@/lib/data/mock-store";
import { filterWalletTransactionsForAccount } from "@/lib/data/filters";
import { resolveWalletForUser } from "@/lib/wallet/payee-resolver";
import { naira, formatDate } from "@/lib/format";
import type { BankDetails } from "@/lib/data/types";

export const Route = createFileRoute("/dashboard/wallet/my")({ component: MyWalletPage });

function MyWalletPage() {
  const { role, user } = useRole();
  const {
    staffMembers,
    walletAccounts,
    walletTransactions,
    withdrawViaPaystack,
    updatePayoutBank,
  } = useMockStore();

  const wallet = resolveWalletForUser(role, user, staffMembers, walletAccounts);
  const [showWithdraw, setShowWithdraw] = React.useState(false);
  const [editingBank, setEditingBank] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const txs = wallet ? filterWalletTransactionsForAccount(walletTransactions, wallet.id) : [];

  const copyDva = () => {
    if (!wallet?.paystackDva) return;
    const text = `${wallet.paystackDva.bankName}\n${wallet.paystackDva.accountNumber}\n${wallet.paystackDva.accountName}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!wallet) {
    return (
      <>
        <PageHeader title="My Wallet" description="Your Paystack salary wallet." />
        <Card className="p-8 text-center text-sm text-[--text-muted]">
          No wallet account is linked to your profile. Contact HQ admin for assistance.
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="My Wallet"
        description="Salary wallet powered by Paystack DVA — withdraw instantly to your bank."
        actions={
          wallet.balance > 0 && wallet.payoutBank ? (
            <Button
              className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
              size="sm"
              onClick={() => setShowWithdraw(true)}
            >
              <ArrowDownToLine className="h-4 w-4 mr-1.5" /> Withdraw via Paystack
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Wallet} label="Available Balance" value={naira(wallet.balance)} iconTone="navy" />
        <StatCard icon={CreditCard} label="Paystack DVA" value="Active" iconTone="success" />
      </div>

      {wallet.paystackDva && (
        <Card className="mt-4 border-[--accent-primary]/20 bg-[--bg-base]/30">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Your Paystack Virtual Account</CardTitle>
              <Button size="sm" variant="outline" onClick={copyDva}>
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </CardHeader>
          <div className="px-5 pb-5 text-sm">
            <p className="text-xs text-[--text-muted] mb-4">
              Salary credits from HQ are deposited to this account. You can also receive transfers here.
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <dt className="text-xs text-[--text-muted]">Bank</dt>
                <dd className="font-medium mt-0.5">{wallet.paystackDva.bankName}</dd>
              </div>
              <div>
                <dt className="text-xs text-[--text-muted]">Account Number</dt>
                <dd className="font-mono text-lg font-semibold mt-0.5 tracking-wide">{wallet.paystackDva.accountNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-[--text-muted]">Account Name</dt>
                <dd className="font-medium mt-0.5">{wallet.paystackDva.accountName}</dd>
              </div>
            </dl>
          </div>
        </Card>
      )}

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Payout Bank Account</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setEditingBank(true)}>
              {wallet.payoutBank ? "Edit" : "Link Bank"}
            </Button>
          </div>
        </CardHeader>
        <div className="px-5 pb-5 text-sm">
          {wallet.payoutBank ? (
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <dt className="text-xs text-[--text-muted]">Bank</dt>
                <dd className="font-medium mt-0.5">{wallet.payoutBank.bankName}</dd>
              </div>
              <div>
                <dt className="text-xs text-[--text-muted]">Account Number</dt>
                <dd className="font-mono mt-0.5">{wallet.payoutBank.accountNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-[--text-muted]">Account Name</dt>
                <dd className="font-medium mt-0.5">{wallet.payoutBank.accountName}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-[--text-muted]">
              Link your bank account to withdraw funds instantly via Paystack — no admin approval needed.
            </p>
          )}
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Description</th>
                <th className="text-left px-3 py-3 font-medium">Type</th>
                <th className="text-right px-3 py-3 font-medium">Amount</th>
                <th className="text-right px-3 py-3 font-medium">Balance</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-default]">
              {txs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[--text-muted]">No transactions yet.</td>
                </tr>
              )}
              {txs.map((tx) => (
                <tr key={tx.id} className="hover:bg-[--bg-base]/50">
                  <td className="px-5 py-3">{tx.description}</td>
                  <td className="px-3 py-3 capitalize text-[--text-muted]">{tx.type.replace("_", " ")}</td>
                  <td className={`px-3 py-3 text-right font-mono ${tx.type === "withdrawal" ? "text-red-700" : "text-green-700"}`}>
                    {tx.type === "withdrawal" ? "−" : "+"}{naira(tx.amount)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono">{naira(tx.balanceAfter)}</td>
                  <td className="px-5 py-3 text-xs text-[--text-muted]">{formatDate(tx.at.slice(0, 10))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showWithdraw && (
        <WithdrawModal
          maxAmount={wallet.balance}
          payoutBank={wallet.payoutBank}
          onClose={() => setShowWithdraw(false)}
          onSubmit={(amount) => {
            withdrawViaPaystack(wallet.id, amount, user.id);
            setShowWithdraw(false);
          }}
        />
      )}

      {editingBank && (
        <BankDetailsModal
          initial={wallet.payoutBank}
          onClose={() => setEditingBank(false)}
          onSave={(bank) => {
            updatePayoutBank(wallet.id, bank);
            setEditingBank(false);
          }}
        />
      )}
    </>
  );
}

function WithdrawModal({
  maxAmount,
  payoutBank,
  onClose,
  onSubmit,
}: {
  maxAmount: number;
  payoutBank?: BankDetails;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}) {
  const [amount, setAmount] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!parsed || parsed <= 0 || parsed > maxAmount) return;
    onSubmit(parsed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--border-default]">
          <h2 className="text-base font-semibold">Withdraw via Paystack</h2>
          <button type="button" onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[--text-muted]">
            Funds will be transferred instantly to your linked bank account. No admin approval required.
          </p>
          {payoutBank && (
            <div className="rounded-md bg-[--bg-base] p-3 text-xs">
              <p className="font-medium">{payoutBank.accountName}</p>
              <p className="text-[--text-muted]">{payoutBank.bankName} · {payoutBank.accountNumber}</p>
            </div>
          )}
          <p className="text-xs text-[--text-muted]">Available: {naira(maxAmount)}</p>
          <Field label="Amount (₦)" value={amount} onChange={setAmount} type="number" required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
              Send Transfer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function BankDetailsModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: BankDetails;
  onClose: () => void;
  onSave: (bank: BankDetails) => void;
}) {
  const [bankName, setBankName] = React.useState(initial?.bankName ?? "");
  const [accountNumber, setAccountNumber] = React.useState(initial?.accountNumber ?? "");
  const [accountName, setAccountName] = React.useState(initial?.accountName ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--border-default]">
          <h2 className="text-base font-semibold">Payout Bank Account</h2>
          <button type="button" onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          className="p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ bankName: bankName.trim(), accountNumber: accountNumber.trim(), accountName: accountName.trim() });
          }}
        >
          <p className="text-xs text-[--text-muted]">This account receives Paystack transfers when you withdraw.</p>
          <Field label="Bank Name" value={bankName} onChange={setBankName} required />
          <Field label="Account Number" value={accountNumber} onChange={setAccountNumber} required />
          <Field label="Account Name" value={accountName} onChange={setAccountName} required />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
              Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[--text-muted]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
        required={required}
        min={type === "number" ? 1 : undefined}
      />
    </div>
  );
}
