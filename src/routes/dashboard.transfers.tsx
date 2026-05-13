import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, ArrowRight, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { transfers, pastorName, branchName, findPastor } from "@/lib/data/seed";
import { formatDate, initials } from "@/lib/format";

export const Route = createFileRoute("/dashboard/transfers")({ component: TransfersPage });

function TransfersPage() {
  const pending = transfers.filter(t => t.status === "Pending");
  const all = transfers;

  return (
    <>
      <PageHeader title="Transfers & Appointments" description="Manage pastoral transfers across branches and states."
        actions={<Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" size="sm"><Plus className="h-4 w-4 mr-1.5" /> Initiate Transfer</Button>}
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
                      <Button size="sm" className="!bg-[var(--state-success)] !text-white hover:!bg-green-700 flex-1">Approve</Button>
                      <Button size="sm" variant="outline" className="flex-1 text-[--state-error] border-[--state-error]/30 hover:bg-red-50">Reject</Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
