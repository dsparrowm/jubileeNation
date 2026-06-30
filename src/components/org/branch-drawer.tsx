import * as React from "react";
import { Link } from "@tanstack/react-router";
import { X, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import {
  reports,
  transfers,
  pastors,
  branchAttendanceTrend,
  pastorName,
  stateName,
  findPastor,
} from "@/lib/data/seed";
import { formatDate, initials } from "@/lib/format";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import type { Branch } from "@/lib/data/types";

export function BranchDrawer({
  branch,
  onClose,
  showBranchDirectoryLink = false,
}: {
  branch: Branch;
  onClose: () => void;
  showBranchDirectoryLink?: boolean;
}) {
  const senior = findPastor(branch.seniorPastorId);
  const lastReport = reports.find((r) => r.branchId === branch.id && r.period === "Apr 2025");
  const recentTransfers = transfers
    .filter((t) => t.fromBranchId === branch.id || t.toBranchId === branch.id)
    .slice(0, 4);
  const branchPastors = pastors.filter((p) => p.branchId === branch.id);

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
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[--bg-base] text-[--text-muted]">
            <X className="h-4 w-4" />
          </button>
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
                <div className="font-medium text-sm">
                  {senior ? `${senior.firstName} ${senior.lastName}` : "Unassigned"}
                </div>
                <div className="text-xs text-[--text-muted] flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {senior?.phone}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-2 flex items-center justify-between">
              Attendance Trend{" "}
              <span className="text-xs text-[--text-muted] font-normal">Last 6 weeks</span>
            </h3>
            <div className="h-40 rounded-md border border-[--border-default] p-2">
              <ResponsiveContainer>
                <LineChart data={branchAttendanceTrend(branch.id)}>
                  <XAxis dataKey="week" stroke="#6B7280" fontSize={10} />
                  <YAxis stroke="#6B7280" fontSize={10} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#C9A050"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
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
            ) : (
              <p className="text-xs text-[--text-muted]">No report submitted for April 2025.</p>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-2">
              Pastoral Staff{" "}
              <span className="text-xs text-[--text-muted] font-normal font-mono">
                ({branchPastors.length})
              </span>
            </h3>
            <ul className="space-y-1.5">
              {branchPastors.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between text-sm rounded-md border border-[--border-default] px-3 py-2"
                >
                  <span>
                    {p.firstName} {p.lastName}
                  </span>
                  <span className="text-xs text-[--text-muted]">{p.rank}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-2">Recent Transfers</h3>
            <ul className="space-y-1.5">
              {recentTransfers.length === 0 && (
                <p className="text-xs text-[--text-muted]">No recent transfers.</p>
              )}
              {recentTransfers.map((t) => (
                <li
                  key={t.id}
                  className="text-xs px-3 py-2 rounded-md border border-[--border-default] flex justify-between"
                >
                  <span>{pastorName(t.pastorId)}</span>
                  <span className="text-[--text-muted] font-mono">{formatDate(t.effectiveDate)}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-2 pt-2 border-t border-[--border-default]">
            {showBranchDirectoryLink && (
              <Link
                to="/dashboard/branches"
                search={{ branch: branch.id }}
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 rounded-md border border-[--border-default] px-3 py-2 text-sm font-medium text-[--accent-primary] hover:bg-[--bg-base]/60"
              >
                View in Branch Directory
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Edit Branch
              </Button>
              <Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)] flex-1">
                Transfer Pastor
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-[--text-muted]">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono text-sm" : "text-sm"}`}>{value}</div>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[--border-default] p-3">
      <div className="font-mono text-lg font-bold">{value}</div>
      <div className="text-xs text-[--text-muted] mt-0.5">{label}</div>
    </div>
  );
}
