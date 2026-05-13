import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Filter, Building2, X, Phone, Calendar, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import {
  branches, states, reports, transfers, pastors, branchAttendanceTrend,
  pastorName, stateName, findPastor,
} from "@/lib/data/seed";
import { formatDate, initials } from "@/lib/format";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/dashboard/branches")({
  component: BranchesPage,
});

function BranchesPage() {
  const [search, setSearch] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [openId, setOpenId] = React.useState<string | null>(null);

  const filtered = branches.filter(b => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (stateFilter && b.stateId !== stateFilter) return false;
    if (statusFilter) {
      const r = reports.find(rp => rp.branchId === b.id && rp.period === "Apr 2025");
      const s = r?.submittedAt ? "Submitted" : r?.status === "Overdue" ? "Overdue" : "Pending";
      if (s !== statusFilter) return false;
    }
    return true;
  });

  const open = openId ? branches.find(b => b.id === openId) : null;

  return (
    <>
      <PageHeader
        title="Branch Directory"
        description={`${branches.length} branches across ${states.length} states.`}
        actions={
          <Button className="bg-[--accent-primary] hover:bg-[--accent-hover] text-white" size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add Branch
          </Button>
        }
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-[--border-default]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-muted]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search branches..."
              className="w-full rounded-md border border-[--border-default] bg-[--bg-surface] pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--accent-primary]/30 focus:border-[--accent-primary]"
            />
          </div>
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-2 text-sm">
            <option value="">All states</option>
            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-2 text-sm">
            <option value="">All report status</option>
            <option value="Submitted">Submitted</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Branch</th>
                <th className="text-left px-3 py-3 font-medium">State</th>
                <th className="text-left px-3 py-3 font-medium">Senior Pastor</th>
                <th className="text-left px-3 py-3 font-medium">Phone</th>
                <th className="text-right px-3 py-3 font-medium">Attendance</th>
                <th className="text-left px-3 py-3 font-medium">Report</th>
                <th className="text-right px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-default]">
              {filtered.map(b => {
                const r = reports.find(rp => rp.branchId === b.id && rp.period === "Apr 2025");
                const att = r ? r.attendance.adults + r.attendance.youth + r.attendance.children : 0;
                const status = r?.submittedAt ? "Submitted" : r?.status === "Overdue" ? "Overdue" : "Pending";
                return (
                  <tr key={b.id} className="hover:bg-[--bg-base]/50 cursor-pointer" onClick={() => setOpenId(b.id)}>
                    <td className="px-5 py-3 font-medium">{b.name}</td>
                    <td className="px-3 py-3 text-[--text-muted]">{stateName(b.stateId)}</td>
                    <td className="px-3 py-3">{pastorName(b.seniorPastorId)}</td>
                    <td className="px-3 py-3 font-mono text-xs text-[--text-muted]">{b.phone}</td>
                    <td className="px-3 py-3 text-right font-mono">{att}</td>
                    <td className="px-3 py-3"><StatusBadge status={status} /></td>
                    <td className="px-5 py-3 text-right">
                      <button className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium" onClick={(e) => { e.stopPropagation(); setOpenId(b.id); }}>View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-[--text-muted]">No branches match your filters.</div>
          )}
        </div>
      </Card>

      {/* Drawer */}
      {open && <BranchDrawer branch={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

function BranchDrawer({ branch, onClose }: { branch: typeof branches[0]; onClose: () => void }) {
  const senior = findPastor(branch.seniorPastorId);
  const lastReport = reports.find(r => r.branchId === branch.id && r.period === "Apr 2025");
  const recentTransfers = transfers.filter(t => t.fromBranchId === branch.id || t.toBranchId === branch.id).slice(0, 4);
  const branchPastors = pastors.filter(p => p.branchId === branch.id);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="w-full max-w-xl bg-[--bg-surface] shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-[--bg-surface] border-b border-[--border-default] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="text-xs text-[--text-muted]">{stateName(branch.stateId)} State</div>
            <h2 className="text-lg font-semibold mt-0.5">{branch.name}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[--bg-base] text-[--text-muted]"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Address" value={branch.address} />
            <Field label="Founded" value={branch.foundedYear.toString()} mono />
            <Field label="Phone" value={branch.phone} mono />
            <Field label="Status" value={<StatusBadge status={branch.status} />} />
          </div>

          <section>
            <h3 className="text-sm font-semibold mb-2">Senior Pastor</h3>
            <div className="flex items-center gap-3 rounded-md border border-[--border-default] p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-xs font-semibold">
                {senior ? initials(senior.firstName, senior.lastName) : "—"}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{senior ? `${senior.firstName} ${senior.lastName}` : "Unassigned"}</div>
                <div className="text-xs text-[--text-muted] flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{senior?.phone}</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-2 flex items-center justify-between">Attendance Trend <span className="text-xs text-[--text-muted] font-normal">Last 6 weeks</span></h3>
            <div className="h-40 rounded-md border border-[--border-default] p-2">
              <ResponsiveContainer>
                <LineChart data={branchAttendanceTrend(branch.id)}>
                  <XAxis dataKey="week" stroke="#6B7280" fontSize={10} />
                  <YAxis stroke="#6B7280" fontSize={10} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="attendance" stroke="#C9A050" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-2">Last Report Summary</h3>
            {lastReport && lastReport.submittedAt ? (
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Adults" value={lastReport.attendance.adults} />
                <Stat label="Youth" value={lastReport.attendance.youth} />
                <Stat label="Children" value={lastReport.attendance.children} />
                <Stat label="Salvations" value={lastReport.salvations} />
                <Stat label="Baptisms" value={lastReport.baptisms} />
                <Stat label="Cell Groups" value={lastReport.cellGroups.count} />
              </div>
            ) : <p className="text-xs text-[--text-muted]">No report submitted for April 2025.</p>}
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-2">Pastoral Staff <span className="text-xs text-[--text-muted] font-normal font-mono">({branchPastors.length})</span></h3>
            <ul className="space-y-1.5">
              {branchPastors.map(p => (
                <li key={p.id} className="flex items-center justify-between text-sm rounded-md border border-[--border-default] px-3 py-2">
                  <span>{p.firstName} {p.lastName}</span>
                  <span className="text-xs text-[--text-muted]">{p.rank}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-2">Recent Transfers</h3>
            <ul className="space-y-1.5">
              {recentTransfers.length === 0 && <p className="text-xs text-[--text-muted]">No recent transfers.</p>}
              {recentTransfers.map(t => (
                <li key={t.id} className="text-xs px-3 py-2 rounded-md border border-[--border-default] flex justify-between">
                  <span>{pastorName(t.pastorId)}</span>
                  <span className="text-[--text-muted] font-mono">{formatDate(t.effectiveDate)}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex gap-2 pt-2 border-t border-[--border-default]">
            <Button variant="outline" className="flex-1">Edit Branch</Button>
            <Button className="bg-[--accent-primary] hover:bg-[--accent-hover] text-white flex-1">Transfer Pastor</Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-[--text-muted]">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono text-sm" : "text-sm"}`}>{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[--border-default] p-3">
      <div className="font-mono text-lg font-bold">{value}</div>
      <div className="text-xs text-[--text-muted] mt-0.5">{label}</div>
    </div>
  );
}
