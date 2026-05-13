import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Users,
  FileBarChart,
  Wallet,
  ArrowLeftRight,
  Calendar,
  ClipboardList,
  CalendarOff,
  Megaphone,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { StatusBadge, RankBadge } from "@/components/ui-kit/badges";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/role-context";
import {
  branches,
  pastors,
  reports,
  remittances,
  transfers,
  auditFeed,
  announcements,
  attendanceByStateMonthly,
  remittanceByStateCurrent,
  branchAttendanceTrend,
  pastorName,
  branchName,
  stateName,
  leaveRequests,
  events,
  findPastor,
  findBranch,
} from "@/lib/data/seed";
import { naira, formatRelative, formatDate, initials } from "@/lib/format";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { role, user } = useRole();

  if (role === "BRANCH_PASTOR") return <BranchPastorOverview />;
  if (role === "STATE_PASTOR") return <StatePastorOverview />;
  if (role === "STAFF") return <StaffOverview />;
  return <HQOverview />;
}

/* -------------------------------- HQ / GO --------------------------------- */
function HQOverview() {
  const submittedThisMonth = reports.filter(
    (r) => r.period === "Apr 2025" && r.status !== "Overdue" && r.status !== "Pending",
  ).length;
  const totalReportsExpected = branches.length;
  const compliantRemits = remittances.filter(
    (r) => r.period === "Apr 2025" && r.status === "Compliant",
  ).length;
  const compliancePct = Math.round((compliantRemits / branches.length) * 100);
  const pendingTransfers = transfers.filter((t) => t.status === "Pending");

  return (
    <>
      <PageHeader
        title="Overview"
        description="Organisation-wide snapshot across all states and branches."
        actions={
          <Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
            <FileBarChart className="h-4 w-4 mr-1.5" /> Export Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Total Branches"
          value={branches.length}
          hint={`${new Set(branches.map((b) => b.stateId)).size} states`}
          trend={{ dir: "up", value: "+3" }}
          iconTone="gold"
        />
        <StatCard
          icon={Users}
          label="Pastoral Staff"
          value={pastors.length}
          hint="Active across the org"
          trend={{ dir: "up", value: "+5" }}
          iconTone="navy"
        />
        <StatCard
          icon={FileBarChart}
          label="Reports Submitted"
          value={`${submittedThisMonth}/${totalReportsExpected}`}
          hint="April 2025"
          trend={{ dir: "up", value: "12%" }}
          iconTone="info"
        />
        <StatCard
          icon={Wallet}
          label="Remittance Compliance"
          value={`${compliancePct}%`}
          hint="April 2025"
          trend={{ dir: "down", value: "4%" }}
          iconTone="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Attendance Trend</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">Last 6 months · Top 4 states</p>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart
                  data={attendanceByStateMonthly()}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={11} />
                  <YAxis stroke="#6B7280" fontSize={11} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #E5E7EB" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="Rivers"
                    stroke="#C9A050"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Cross River"
                    stroke="#0D1B3E"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Akwa Ibom"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Lagos"
                    stroke="#16A34A"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Remittance by State</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">
                April 2025 · Expected vs Received
              </p>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart
                  data={remittanceByStateCurrent()}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#6B7280"
                    fontSize={11}
                    tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`}
                  />
                  <YAxis
                    type="category"
                    dataKey="state"
                    stroke="#6B7280"
                    fontSize={11}
                    width={70}
                  />
                  <Tooltip
                    formatter={(v: number) => naira(v)}
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #E5E7EB" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="expected" fill="#E5E9F2" name="Expected" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="received" fill="#C9A050" name="Received" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Activity + Pending Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
        <Card className="lg:col-span-3">
          <CardHeader
            action={
              <Link
                to="/dashboard/analytics"
                className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium"
              >
                View all
              </Link>
            }
          >
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">Last 15 platform events</p>
            </div>
          </CardHeader>
          <ul className="divide-y divide-[--border-default]">
            {auditFeed.map((ev) => (
              <li key={ev.id} className="flex items-start gap-3 px-5 py-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-[--bg-base] text-[--text-muted] shrink-0">
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[--text-primary] leading-snug">{ev.description}</p>
                  <p className="text-xs text-[--text-muted] mt-0.5">
                    {pastorName(ev.actorId)} ·{" "}
                    <span className="font-mono">{formatRelative(ev.at)}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            action={
              <Link
                to="/dashboard/transfers"
                className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium"
              >
                View all
              </Link>
            }
          >
            <div>
              <CardTitle>Open Transfers</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">
                {pendingTransfers.length} awaiting approval
              </p>
            </div>
          </CardHeader>
          <ul className="divide-y divide-[--border-default]">
            {pendingTransfers.map((t) => {
              const p = findPastor(t.pastorId)!;
              return (
                <li key={t.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-xs font-semibold">
                      {initials(p.firstName, p.lastName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs text-[--text-muted] mt-0.5 flex items-center gap-1.5">
                        <span className="truncate">{branchName(t.fromBranchId)}</span>
                        <ChevronRight className="h-3 w-3 shrink-0" />
                        <span className="truncate text-[--text-primary]">
                          {branchName(t.toBranchId)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="!bg-[var(--state-success)] !text-white hover:!bg-green-700 h-7 px-3 text-xs flex-1"
                    >
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-3 text-xs flex-1">
                      View
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}

/* ----------------------------- STATE PASTOR ------------------------------ */
function StatePastorOverview() {
  const { user } = useRole();
  const stateId = user.stateId;
  const stBranches = branches.filter((b) => b.stateId === stateId);
  const stPastors = pastors.filter((p) => p.stateId === stateId);
  const stReports = reports.filter(
    (r) => stBranches.some((b) => b.id === r.branchId) && r.period === "Apr 2025" && r.submittedAt,
  );
  const stPendingLeave = leaveRequests.filter(
    (l) => stPastors.some((p) => p.id === l.pastorId) && l.status === "Pending",
  );
  const stRemits = remittances.filter(
    (r) => stBranches.some((b) => b.id === r.branchId) && r.period === "Apr 2025",
  );

  const attendanceData = stBranches.map((b) => {
    const r = reports.find((rp) => rp.branchId === b.id && rp.period === "Apr 2025");
    return {
      branch: b.name.split(" ")[0],
      attendance: r ? r.attendance.adults + r.attendance.youth + r.attendance.children : 0,
    };
  });

  return (
    <>
      <PageHeader
        title={`${stateName(stateId)} State Overview`}
        description={`Snapshot of all branches and pastoral staff in ${stateName(stateId)} State.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Branches" value={stBranches.length} iconTone="gold" />
        <StatCard icon={Users} label="Pastors" value={stPastors.length} iconTone="navy" />
        <StatCard
          icon={FileBarChart}
          label="Reports This Month"
          value={`${stReports.length}/${stBranches.length}`}
          iconTone="info"
        />
        <StatCard
          icon={CalendarOff}
          label="Pending Leave"
          value={stPendingLeave.length}
          iconTone="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div>
              <CardTitle>Branch Attendance</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">
                April 2025 · Total attendance per branch
              </p>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart
                  data={attendanceData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="branch" stroke="#6B7280" fontSize={11} />
                  <YAxis stroke="#6B7280" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="attendance" fill="#C9A050" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Branch Compliance</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">April 2025</p>
            </div>
          </CardHeader>
          <div className="overflow-y-auto max-h-72">
            <table className="w-full text-sm">
              <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
                <tr>
                  <th className="text-left px-5 py-2 font-medium">Branch</th>
                  <th className="text-left px-3 py-2 font-medium">Report</th>
                  <th className="text-left px-3 py-2 font-medium">Remit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border-default]">
                {stBranches.map((b) => {
                  const rep = reports.find((r) => r.branchId === b.id && r.period === "Apr 2025");
                  const rem = stRemits.find((r) => r.branchId === b.id);
                  return (
                    <tr key={b.id}>
                      <td className="px-5 py-2.5 truncate">{b.name}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={rep?.submittedAt ? "Submitted" : "Pending"} />
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={rem?.status ?? "Pending"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

/* ---------------------------- BRANCH PASTOR ------------------------------ */
function BranchPastorOverview() {
  const { user } = useRole();
  // Mock: assign first branch to BRANCH_PASTOR view
  const branch = branches[0];
  const lastReport = reports.find((r) => r.branchId === branch.id && r.period === "Apr 2025");
  const upcoming = events.slice(0, 3);
  const recentAnn = announcements.slice(0, 3);

  return (
    <>
      <PageHeader
        title={`${branch.name}`}
        description={`Welcome back, Pastor ${user.firstName}. Here's the snapshot for your branch.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Last Attendance"
          value={
            lastReport
              ? lastReport.attendance.adults +
                lastReport.attendance.youth +
                lastReport.attendance.children
              : 0
          }
          hint="April 2025 service"
          iconTone="gold"
        />
        <StatCard
          icon={ClipboardList}
          label="This Month's Report"
          value={lastReport?.status ?? "Pending"}
          iconTone="info"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming Events"
          value={upcoming.length}
          hint="Next 60 days"
          iconTone="navy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Attendance Trend</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">Last 6 weeks</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={branchAttendanceTrend(branch.id)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="week" stroke="#6B7280" fontSize={11} />
                  <YAxis stroke="#6B7280" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#C9A050"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#C9A050" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quick Actions</CardTitle>
            </div>
          </CardHeader>
          <CardBody className="space-y-2">
            <Link
              to="/dashboard/reports/submit"
              className="flex items-center justify-between rounded-md border border-[--border-default] px-4 py-3 hover:bg-[--bg-base] hover:border-[--accent-primary]/30"
            >
              <span className="flex items-center gap-2.5 text-sm font-medium">
                <ClipboardList className="h-4 w-4 text-[--accent-primary]" /> Submit Monthly Report
              </span>
              <ChevronRight className="h-4 w-4 text-[--text-muted]" />
            </Link>
            <Link
              to="/dashboard/leave/apply"
              className="flex items-center justify-between rounded-md border border-[--border-default] px-4 py-3 hover:bg-[--bg-base] hover:border-[--accent-primary]/30"
            >
              <span className="flex items-center gap-2.5 text-sm font-medium">
                <CalendarOff className="h-4 w-4 text-[--accent-primary]" /> Apply for Leave
              </span>
              <ChevronRight className="h-4 w-4 text-[--text-muted]" />
            </Link>
            <Link
              to="/dashboard/documents"
              className="flex items-center justify-between rounded-md border border-[--border-default] px-4 py-3 hover:bg-[--bg-base] hover:border-[--accent-primary]/30"
            >
              <span className="flex items-center gap-2.5 text-sm font-medium">
                <Megaphone className="h-4 w-4 text-[--accent-primary]" /> View Documents
              </span>
              <ChevronRight className="h-4 w-4 text-[--text-muted]" />
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader
          action={
            <Link
              to="/dashboard/announcements"
              className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium"
            >
              View all
            </Link>
          }
        >
          <div>
            <CardTitle>Recent Announcements</CardTitle>
          </div>
        </CardHeader>
        <ul className="divide-y divide-[--border-default]">
          {recentAnn.map((a) => (
            <li key={a.id} className="px-5 py-3.5">
              <div className="flex items-start gap-2 justify-between">
                <p className="text-sm font-medium">{a.title}</p>
                {a.priority === "Urgent" && <StatusBadge status="Urgent" />}
              </div>
              <p className="text-xs text-[--text-muted] mt-1 line-clamp-2">{a.body}</p>
              <p className="text-[11px] text-[--text-muted] mt-1.5 font-mono">
                {formatDate(a.publishedAt)}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

function StaffOverview() {
  return (
    <>
      <PageHeader title="My Branch" description="Read-only access to branch information." />
      <Card>
        <CardBody>
          <p className="text-sm text-[--text-muted]">
            Welcome to JNLOP. Use the menu to view announcements, events, and documents.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
