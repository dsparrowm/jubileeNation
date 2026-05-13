import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Wallet } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { remittances, branches, branchName, stateName, remittanceByStateCurrent } from "@/lib/data/seed";
import { naira, formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/finance")({ component: FinancePage });

function FinancePage() {
  const april = remittances.filter(r => r.period === "Apr 2025");
  const expected = april.reduce((s, r) => s + r.expected, 0);
  const received = april.reduce((s, r) => s + r.received, 0);

  return (
    <>
      <PageHeader title="Finance & Remittance" description="Branch remittance compliance and payment history."
        actions={<Button className="bg-[--accent-primary] hover:bg-[--accent-hover] text-white" size="sm"><Plus className="h-4 w-4 mr-1.5" /> Record Payment</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Wallet} label="Total Expected (April)" value={naira(expected)} iconTone="navy" />
        <StatCard icon={Wallet} label="Total Received" value={naira(received)} iconTone="success" />
        <StatCard icon={Wallet} label="Outstanding Balance" value={naira(expected - received)} iconTone="error" />
      </div>

      <Card className="mt-4">
        <CardHeader><div><CardTitle>Remittance by State · April 2025</CardTitle></div></CardHeader>
        <CardBody>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={remittanceByStateCurrent()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="state" stroke="#6B7280" fontSize={11} />
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
                  <td className="px-3 py-3 font-mono text-xs">{formatDate(r.paidAt)}</td>
                  <td className="px-5 py-3 text-right"><button className="text-xs text-[--accent-primary] font-medium">Record</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
