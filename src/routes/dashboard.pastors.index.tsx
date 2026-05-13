import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, LayoutGrid, List, MoreHorizontal, Phone, Mail } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, RankBadge } from "@/components/ui-kit/badges";
import { pastors, states, branchName, stateName } from "@/lib/data/seed";
import { formatDate, initials } from "@/lib/format";

export const Route = createFileRoute("/dashboard/pastors/")({
  component: PastorsPage,
});

function PastorsPage() {
  const [view, setView] = React.useState<"grid" | "table">("grid");
  const [q, setQ] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState("");
  const [rankFilter, setRankFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  const filtered = pastors.filter(p => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    if (q && !name.includes(q.toLowerCase())) return false;
    if (stateFilter && p.stateId !== stateFilter) return false;
    if (rankFilter && p.rank !== rankFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Pastor Directory"
        description={`${pastors.length} pastoral staff across the organisation.`}
        actions={
          <Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add Pastor
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col lg:flex-row gap-2 p-4 border-b border-[--border-default]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-muted]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name..." className="w-full rounded-md border border-[--border-default] pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--accent-primary]/30" />
          </div>
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="rounded-md border border-[--border-default] px-3 py-2 text-sm">
            <option value="">All states</option>
            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={rankFilter} onChange={(e) => setRankFilter(e.target.value)} className="rounded-md border border-[--border-default] px-3 py-2 text-sm">
            <option value="">All ranks</option>
            {["Deacon", "Pastor", "Senior Pastor", "Zonal Pastor", "State Pastor"].map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-[--border-default] px-3 py-2 text-sm">
            <option value="">All status</option>
            <option>Active</option>
            <option>On Leave</option>
            <option>Transferred</option>
          </select>
          <div className="flex items-center bg-[--bg-base] rounded-md p-0.5">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === "grid" ? "bg-white shadow-sm" : "text-[--text-muted]"}`}><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView("table")} className={`p-1.5 rounded ${view === "table" ? "bg-white shadow-sm" : "text-[--text-muted]"}`}><List className="h-4 w-4" /></button>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {filtered.map(p => (
              <Link key={p.id} to="/dashboard/pastors/$id" params={{ id: p.id }} className="group rounded-lg border border-[--border-default] p-4 hover:border-[--accent-primary]/40 hover:shadow-sm transition">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-sm font-semibold">
                    {initials(p.firstName, p.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm truncate">{p.firstName} {p.lastName}</div>
                      <button onClick={(e) => e.preventDefault()} className="text-[--text-muted] hover:text-[--text-primary]"><MoreHorizontal className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-1.5"><RankBadge rank={p.rank} /></div>
                    <div className="text-xs text-[--text-muted] mt-2 truncate">{branchName(p.branchId) === "—" ? `${stateName(p.stateId)} State Office` : branchName(p.branchId)}</div>
                    <div className="text-[11px] text-[--text-muted] mt-1 font-mono">{p.phone}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-3 py-3 font-medium">Rank</th>
                  <th className="text-left px-3 py-3 font-medium">Branch</th>
                  <th className="text-left px-3 py-3 font-medium">State</th>
                  <th className="text-left px-3 py-3 font-medium">Ordained</th>
                  <th className="text-left px-3 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border-default]">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-[--bg-base]/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-[10px] font-semibold">{initials(p.firstName, p.lastName)}</div>
                        <span className="font-medium">{p.firstName} {p.lastName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><RankBadge rank={p.rank} /></td>
                    <td className="px-3 py-3 text-[--text-muted]">{branchName(p.branchId)}</td>
                    <td className="px-3 py-3 text-[--text-muted]">{stateName(p.stateId)}</td>
                    <td className="px-3 py-3 font-mono text-xs">{formatDate(p.ordainedAt)}</td>
                    <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3 text-right"><Link to="/dashboard/pastors/$id" params={{ id: p.id }} className="text-xs text-[--accent-primary] font-medium">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-[--text-muted]">No pastors match your filters.</div>}
      </Card>
    </>
  );
}
