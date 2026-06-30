import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Network, Search, Phone, Pencil, Save } from "lucide-react";
import { BranchDrawer, Field, Stat } from "@/components/org/branch-drawer";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import {
  reports, pastors, branchAttendanceTrend,
  pastorName, stateName, findPastor,
} from "@/lib/data/seed";
import { filterBranches } from "@/lib/data/filters";
import { useRole } from "@/lib/role-context";
import { useMockStore } from "@/lib/data/mock-store";
import { initials } from "@/lib/format";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import type { Branch, State } from "@/lib/data/types";

export const Route = createFileRoute("/dashboard/branches")({
  component: BranchesPage,
  validateSearch: (search: Record<string, unknown>) => ({
    branch: typeof search.branch === "string" ? search.branch : undefined,
  }),
});

function BranchesPage() {
  const { role, user } = useRole();
  const { branches: storeBranches, states: storeStates } = useMockStore();

  if (role === "BRANCH_PASTOR") {
    const branch = storeBranches.find((b) => b.id === user.branchId);
    if (!branch) {
      return (
        <PageHeader title="Branch Profile" description="No branch assigned to your account." />
      );
    }
    return <BranchPastorProfile branch={branch} />;
  }

  return <BranchDirectory branches={storeBranches} states={storeStates} role={role} user={user} />;
}

function BranchPastorProfile({ branch: initialBranch }: { branch: Branch }) {
  const { updateBranchContact, branches } = useMockStore();
  const branch = branches.find((b) => b.id === initialBranch.id) ?? initialBranch;
  const [editing, setEditing] = React.useState(false);
  const [phone, setPhone] = React.useState(branch.phone);
  const [address, setAddress] = React.useState(branch.address);

  React.useEffect(() => {
    setPhone(branch.phone);
    setAddress(branch.address);
  }, [branch.phone, branch.address]);

  const senior = findPastor(branch.seniorPastorId);
  const branchPastors = pastors.filter((p) => p.branchId === branch.id);
  const lastReport = reports.find((r) => r.branchId === branch.id && r.period === "Apr 2025");

  const handleSave = () => {
    updateBranchContact(branch.id, { phone, address });
    setEditing(false);
  };

  return (
    <>
      <PageHeader
        title={branch.name}
        description={`${stateName(branch.stateId)} State · Branch profile`}
        actions={
          editing ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setPhone(branch.phone); setAddress(branch.address); setEditing(false); }}>
                Cancel
              </Button>
              <Button size="sm" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" onClick={handleSave}>
                <Save className="h-3.5 w-3.5 mr-1.5" /> Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Contact
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Branch Details</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-[--text-muted]">Address</div>
                {editing ? (
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm" />
                ) : (
                  <div className="mt-0.5">{branch.address}</div>
                )}
              </div>
              <div>
                <div className="text-xs text-[--text-muted]">Phone</div>
                {editing ? (
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm font-mono" />
                ) : (
                  <div className="mt-0.5 font-mono">{branch.phone}</div>
                )}
              </div>
              <Field label="Founded" value={branch.foundedYear.toString()} mono />
              <Field label="Status" value={<StatusBadge status={branch.status} />} />
              <Field label="State" value={stateName(branch.stateId)} />
              <Field label="Senior Pastor" value={pastorName(branch.seniorPastorId)} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <p className="text-xs text-[--text-muted]">Last 6 weeks</p>
          </CardHeader>
          <CardBody>
            <div className="h-40">
              <ResponsiveContainer>
                <LineChart data={branchAttendanceTrend(branch.id)}>
                  <XAxis dataKey="week" stroke="#6B7280" fontSize={10} />
                  <YAxis stroke="#6B7280" fontSize={10} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  <Line type="monotone" dataKey="attendance" stroke="#C9A050" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Pastoral Staff</CardTitle>
          <p className="text-xs text-[--text-muted]">Co-pastors and ministers at your branch</p>
        </CardHeader>
        <CardBody>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {branchPastors.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-lg border border-[--border-default] p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-xs font-semibold">
                  {initials(p.firstName, p.lastName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{p.firstName} {p.lastName}</div>
                  <div className="text-xs text-[--text-muted]">{p.rank} · {p.status}</div>
                  <div className="text-xs text-[--text-muted] flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3" />{p.phone}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {lastReport?.submittedAt && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Last Monthly Report (Apr 2025)</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              <Stat label="Adults" value={lastReport.attendance.adults} />
              <Stat label="Youth" value={lastReport.attendance.youth} />
              <Stat label="Children" value={lastReport.attendance.children} />
              <Stat label="Salvations" value={lastReport.salvations} />
              <Stat label="Baptisms" value={lastReport.baptisms} />
              <Stat label="Cell Groups" value={lastReport.cellGroups.count} />
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
}

function BranchDirectory({
  branches: storeBranches,
  states: storeStates,
  role,
  user,
}: {
  branches: Branch[];
  states: State[];
  role: ReturnType<typeof useRole>["role"];
  user: ReturnType<typeof useRole>["user"];
}) {
  const routeSearch = Route.useSearch();
  const [search, setSearch] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [openId, setOpenId] = React.useState<string | null>(routeSearch.branch ?? null);

  React.useEffect(() => {
    if (routeSearch.branch) setOpenId(routeSearch.branch);
  }, [routeSearch.branch]);

  const scoped = filterBranches({ role, user }, storeBranches);
  const filtered = scoped.filter(b => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (stateFilter && b.stateId !== stateFilter) return false;
    if (statusFilter) {
      const r = reports.find(rp => rp.branchId === b.id && rp.period === "Apr 2025");
      const s = r?.submittedAt ? "Submitted" : r?.status === "Overdue" ? "Overdue" : "Pending";
      if (s !== statusFilter) return false;
    }
    return true;
  });

  const open = openId ? scoped.find(b => b.id === openId) : null;

  return (
    <>
      <PageHeader
        title="Branch Directory"
        description={
          role === "HQ_ADMIN" || role === "GENERAL_OVERSEER"
            ? `${scoped.length} branches across ${storeStates.length} states. Add branches via Org Structure.`
            : `${scoped.length} branches across ${storeStates.length} states.`
        }
        actions={
          role === "HQ_ADMIN" || role === "GENERAL_OVERSEER" ? (
            <Link to="/dashboard/org-structure">
              <Button variant="outline" size="sm">
                <Network className="h-4 w-4 mr-1.5" /> Manage Org Structure
              </Button>
            </Link>
          ) : undefined
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
          {role !== "STAFF" && (
            <>
              <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-2 text-sm">
                <option value="">All states</option>
                {storeStates.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-2 text-sm">
                <option value="">All report status</option>
                <option value="Submitted">Submitted</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </>
          )}
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

      {open && <BranchDrawer branch={open} onClose={() => setOpenId(null)} />}
    </>
  );
}
