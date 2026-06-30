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
  ShieldAlert,
  CheckSquare,
  Inbox,
  MapPin,
  Phone,
  AlertTriangle,
  TrendingUp,
  Music,
  ClipboardCheck,
  Megaphone as MegaphoneIcon,
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
import { StatusBadge } from "@/components/ui-kit/badges";
import { Button } from "@/components/ui/button";
import {
  CHART_COLORS,
  CHART_PALETTE,
  chartTooltipStyle,
  chartGridProps,
  chartAxisProps,
} from "@/components/ui-kit/chart-theme";
import { useRole } from "@/lib/role-context";
import { useMockStore } from "@/lib/data/mock-store";
import {
  filterAnnouncements,
  filterEvents,
  filterTasks,
  filterInbox,
  filterTransfersByState,
  filterLeaveByState,
  filterWeeklyReports,
  filterMonthlySummaries,
} from "@/lib/data/filters";
import {
  branches,
  pastors,
  remittances,
  announcements,
  attendanceByStateMonthly,
  remittanceByStateCurrent,
  branchAttendanceTrend,
  salvationsTrend,
  complianceSnapshots,
  events,
  inboxMessages,
  states,
  findPastor,
  findBranch,
  pastorName,
  branchName,
  stateName,
  CURRENT_MONTH,
  CURRENT_WEEK_ENDING,
} from "@/lib/data/seed";
import { naira, formatRelative, formatDate, initials } from "@/lib/format";

const CURRENT_PERIOD = "Apr 2025";
const TODAY = "2025-05-13";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { role } = useRole();

  if (role === "BRANCH_PASTOR") return <BranchPastorOverview />;
  if (role === "STATE_PASTOR") return <StatePastorOverview />;
  if (role === "STAFF") return <StaffOverview />;
  return <HQOverview />;
}

/* -------------------------------- HQ / GO --------------------------------- */
function HQOverview() {
  const { role, user } = useRole();
  const { reports, transfers, auditFeed, approveTransfer, pendingApprovalsCount } = useMockStore();

  const submittedThisMonth = reports.filter(
    (r) => r.period === CURRENT_PERIOD && r.submittedAt,
  ).length;
  const pendingTransfers = transfers.filter((t) => t.status === "Pending");
  const topPending = pendingTransfers.slice(0, 5);
  const compliantRemits = remittances.filter(
    (r) => r.period === CURRENT_PERIOD && r.status === "Compliant",
  ).length;
  const compliancePct = Math.round((compliantRemits / branches.length) * 100);
  const complianceAlerts = complianceSnapshots.filter(
    (c) =>
      c.period === CURRENT_PERIOD &&
      (c.reportStatus === "Overdue" ||
        c.reportStatus === "Pending" ||
        c.remitStatus === "Outstanding" ||
        c.remitStatus === "Partial"),
  );
  const recentAudit = auditFeed.slice(0, 10);
  const topStates = states.slice(0, 4);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Organisation-wide snapshot across all states and branches."
        actions={
          <div className="flex items-center gap-2">
            {pendingApprovalsCount({ role, user }) > 0 && (
              <Link to="/dashboard/transfers">
                <Button variant="outline" size="sm">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                  {pendingApprovalsCount({ role, user })} pending
                </Button>
              </Link>
            )}
            <Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
              <FileBarChart className="h-4 w-4 mr-1.5" /> Export Report
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Total Branches"
          value={branches.length}
          hint={`${states.length} states`}
          trend={{ dir: "up", value: "+3" }}
          iconTone="gold"
        />
        <StatCard
          icon={FileBarChart}
          label="Reports Submitted"
          value={`${submittedThisMonth}/${branches.length}`}
          hint={CURRENT_PERIOD}
          trend={{ dir: "up", value: "12%" }}
          iconTone="info"
        />
        <StatCard
          icon={ArrowLeftRight}
          label="Pending Transfers"
          value={pendingTransfers.length}
          hint="Awaiting approval"
          iconTone="warning"
        />
        <StatCard
          icon={Wallet}
          label="Remittance Compliance"
          value={`${compliancePct}%`}
          hint={CURRENT_PERIOD}
          trend={{ dir: "down", value: "4%" }}
          iconTone="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Attendance Trend</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">Last 6 months · Top 4 states</p>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart
                  data={attendanceByStateMonthly()}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid {...chartGridProps} />
                  <XAxis dataKey="month" {...chartAxisProps} />
                  <YAxis {...chartAxisProps} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {topStates.map((s, i) => (
                    <Line
                      key={s.id}
                      type="monotone"
                      dataKey={s.name}
                      stroke={CHART_PALETTE[i]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Ministry Impact</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">Salvations & baptisms</p>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={salvationsTrend()} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis dataKey="month" {...chartAxisProps} />
                  <YAxis {...chartAxisProps} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="salvations"
                    name="Salvations"
                    fill={CHART_COLORS.gold}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="baptisms"
                    name="Baptisms"
                    fill={CHART_COLORS.navy}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Remittance by State</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">
                {CURRENT_PERIOD} · Expected vs Received
              </p>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart
                  data={remittanceByStateCurrent()}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 30, bottom: 0 }}
                >
                  <CartesianGrid {...chartGridProps} horizontal={false} vertical />
                  <XAxis
                    type="number"
                    {...chartAxisProps}
                    tickFormatter={(v) => `₦${(v / 1000000).toFixed(1)}M`}
                  />
                  <YAxis type="category" dataKey="state" {...chartAxisProps} width={70} />
                  <Tooltip
                    formatter={(v: number) => naira(v)}
                    contentStyle={chartTooltipStyle}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="expected" fill="#E5E9F2" name="Expected" radius={[0, 3, 3, 0]} />
                  <Bar
                    dataKey="received"
                    fill={CHART_COLORS.gold}
                    name="Received"
                    radius={[0, 3, 3, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            action={
              <Link
                to="/dashboard/compliance"
                className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium"
              >
                View all
              </Link>
            }
          >
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[--state-warning]" />
                Compliance Alerts
              </CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">
                {complianceAlerts.length} branches need attention
              </p>
            </div>
          </CardHeader>
          <ul className="divide-y divide-[--border-default] max-h-64 overflow-y-auto">
            {complianceAlerts.slice(0, 8).map((c) => (
              <li key={c.branchId} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{branchName(c.branchId)}</p>
                  <p className="text-xs text-[--text-muted] mt-0.5">
                    Report due {formatDate(c.reportDue)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  <StatusBadge status={c.reportStatus} />
                  <StatusBadge status={c.remitStatus} />
                </div>
              </li>
            ))}
            {complianceAlerts.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-[--text-muted]">
                All branches compliant
              </li>
            )}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
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
              <CardTitle>Approval Center</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">
                Top {topPending.length} pending transfers
              </p>
            </div>
          </CardHeader>
          <ul className="divide-y divide-[--border-default]">
            {topPending.map((t) => {
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
                      onClick={() => approveTransfer(t.id, user.id)}
                    >
                      Approve
                    </Button>
                    <Link to="/dashboard/transfers" className="flex-1">
                      <Button size="sm" variant="outline" className="h-7 px-3 text-xs w-full">
                        View
                      </Button>
                    </Link>
                  </div>
                </li>
              );
            })}
            {topPending.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-[--text-muted]">
                No pending transfers
              </li>
            )}
          </ul>
        </Card>

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
              <CardTitle>Audit Feed</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">Latest platform activity</p>
            </div>
          </CardHeader>
          <ul className="divide-y divide-[--border-default] max-h-[420px] overflow-y-auto">
            {recentAudit.map((ev) => (
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
      </div>
    </>
  );
}

/* ----------------------------- STATE PASTOR ------------------------------ */
type PerformanceMetric = "attendance" | "salvations" | "baptisms" | "offering";

function StatePastorOverview() {
  const { role, user } = useRole();
  const { reports, transfers, leaveRequests, pendingApprovalsCount } = useMockStore();
  const ctx = { role, user };
  const stateId = user.stateId;
  const [metric, setMetric] = React.useState<PerformanceMetric>("attendance");

  const stBranches = branches.filter((b) => b.stateId === stateId);
  const stPastors = pastors.filter((p) => p.stateId === stateId);
  const stReports = reports.filter(
    (r) =>
      stBranches.some((b) => b.id === r.branchId) &&
      r.period === CURRENT_PERIOD,
  );
  const submittedCount = stReports.filter((r) => r.submittedAt).length;
  const reportPct = Math.round((submittedCount / Math.max(stBranches.length, 1)) * 100);

  const stPendingLeave = filterLeaveByState(
    ctx,
    leaveRequests,
    (pid) => findPastor(pid)?.stateId,
  ).filter((l) => l.status === "Pending");

  const stPendingTransfers = filterTransfersByState(
    ctx,
    transfers,
    (bid) => findBranch(bid)?.stateId,
  ).filter((t) => t.status === "Pending");

  const stRemits = remittances.filter(
    (r) => stBranches.some((b) => b.id === r.branchId) && r.period === CURRENT_PERIOD,
  );

  const pendingCount = pendingApprovalsCount(ctx);

  const getMetricValue = (branchId: string, period: string, m: PerformanceMetric): number => {
    const r = reports.find((rp) => rp.branchId === branchId && rp.period === period);
    if (!r) return 0;
    if (m === "attendance") return r.attendance.adults + r.attendance.youth + r.attendance.children;
    if (m === "salvations") return r.salvations;
    if (m === "baptisms") return r.baptisms;
    return r.offering;
  };

  const comparePeriod = "Mar 2025";
  const performanceRows = stBranches.map((b) => {
    const current = getMetricValue(b.id, CURRENT_PERIOD, metric);
    const previous = getMetricValue(b.id, comparePeriod, metric);
    const change = current - previous;
    const changePct = previous > 0 ? Math.round((change / previous) * 100) : 0;
    return {
      id: b.id,
      branch: b.name,
      shortName: b.name.split(" ").slice(0, 2).join(" "),
      current,
      previous,
      change,
      changePct,
    };
  });

  const performanceChartData = performanceRows.map((r) => ({
    branch: r.shortName,
    current: r.current,
    previous: r.previous,
  }));

  const sortedByChange = [...performanceRows].sort((a, b) => b.changePct - a.changePct);
  const topPerformers = sortedByChange.slice(0, 3);
  const bottomPerformers = sortedByChange.slice(-3).reverse();

  const metricLabels: Record<PerformanceMetric, string> = {
    attendance: "Attendance",
    salvations: "Salvations",
    baptisms: "Baptisms",
    offering: "Offering",
  };

  const formatMetric = (v: number) =>
    metric === "offering" ? naira(v) : v.toLocaleString();

  return (
    <>
      <PageHeader
        title={`${stateName(stateId)} State Overview`}
        description={`State command center — branches, approvals, and reporting for ${stateName(stateId)}.`}
        actions={
          <Link to="/dashboard/compliance">
            <Button variant="outline" size="sm">
              <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
              Compliance
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Branches" value={stBranches.length} iconTone="gold" />
        <StatCard icon={Users} label="Pastors" value={stPastors.length} iconTone="navy" />
        <StatCard
          icon={CalendarOff}
          label="Pending Leave"
          value={stPendingLeave.length}
          iconTone="warning"
        />
        <StatCard
          icon={ArrowLeftRight}
          label="Pending Transfers"
          value={stPendingTransfers.length}
          iconTone="info"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/dashboard/approvals">
          <Button variant="outline" size="sm">
            <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />
            Approvals{pendingCount > 0 ? ` (${pendingCount})` : ""}
          </Button>
        </Link>
        <Link to="/dashboard/reports/submit">
          <Button variant="outline" size="sm">
            <FileBarChart className="h-3.5 w-3.5 mr-1.5" />
            Submit Report
          </Button>
        </Link>
        <Link to="/dashboard/transfers">
          <Button variant="outline" size="sm">
            <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" />
            Initiate Transfer
          </Button>
        </Link>
        <Link to="/dashboard/announcements">
          <Button variant="outline" size="sm">
            <MegaphoneIcon className="h-3.5 w-3.5 mr-1.5" />
            New Announcement
          </Button>
        </Link>
      </div>

      {(stPendingLeave.length > 0 || stPendingTransfers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {stPendingLeave.length > 0 && (
            <Card>
              <CardHeader
                action={
                  <Link
                    to="/dashboard/leave"
                    className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium"
                  >
                    View all
                  </Link>
                }
              >
                <div>
                  <CardTitle>Pending Leave</CardTitle>
                  <p className="text-xs text-[--text-muted] mt-0.5">
                    {stPendingLeave.length} awaiting approval
                  </p>
                </div>
              </CardHeader>
              <ul className="divide-y divide-[--border-default]">
                {stPendingLeave.slice(0, 4).map((l) => {
                  const p = findPastor(l.pastorId)!;
                  return (
                    <li key={l.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium">
                          {p.firstName} {p.lastName}
                        </p>
                        <p className="text-xs text-[--text-muted] mt-0.5">
                          {l.type} · {formatDate(l.fromDate)} – {formatDate(l.toDate)}
                        </p>
                      </div>
                      <StatusBadge status="Pending" />
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {stPendingTransfers.length > 0 && (
            <Card>
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
                  <CardTitle>Pending Transfers</CardTitle>
                  <p className="text-xs text-[--text-muted] mt-0.5">
                    {stPendingTransfers.length} awaiting review
                  </p>
                </div>
              </CardHeader>
              <ul className="divide-y divide-[--border-default]">
                {stPendingTransfers.slice(0, 4).map((t) => {
                  const p = findPastor(t.pastorId)!;
                  return (
                    <li key={t.id} className="px-5 py-3">
                      <p className="text-sm font-medium">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs text-[--text-muted] mt-0.5 flex items-center gap-1">
                        {branchName(t.fromBranchId)}
                        <ChevronRight className="h-3 w-3" />
                        {branchName(t.toBranchId)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>
      )}

      <Card className="mt-4">
        <CardBody>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-[--text-primary]">
                Report Submission Progress
              </p>
              <p className="text-xs text-[--text-muted] mt-0.5">
                {submittedCount} of {stBranches.length} branches · {CURRENT_PERIOD}
              </p>
            </div>
            <span className="font-display font-mono text-2xl font-bold text-[--accent-primary]">
              {reportPct}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[--bg-base] overflow-hidden">
            <div
              className="h-full rounded-full bg-[--accent-primary] transition-all duration-500"
              style={{ width: `${reportPct}%` }}
            />
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            <div>
              <CardTitle>State Performance</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">
                {CURRENT_PERIOD} vs {comparePeriod} · {stateName(stateId)} branches
              </p>
            </div>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as PerformanceMetric)}
              className="rounded-md border border-[--border-default] px-3 py-1.5 text-sm bg-white"
            >
              {(Object.keys(metricLabels) as PerformanceMetric[]).map((m) => (
                <option key={m} value={m}>{metricLabels[m]}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardBody className="pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 h-72">
              <ResponsiveContainer>
                <BarChart
                  data={performanceChartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid {...chartGridProps} />
                  <XAxis dataKey="branch" {...chartAxisProps} />
                  <YAxis {...chartAxisProps} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="previous" fill={CHART_PALETTE[2]} name={comparePeriod} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="current" fill={CHART_COLORS.gold} name={CURRENT_PERIOD} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[--state-success] mb-2">Top performers</p>
                <ul className="space-y-2">
                  {topPerformers.map((r) => (
                    <li key={r.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{r.branch}</span>
                      <span className="font-mono text-xs text-[--state-success] shrink-0 ml-2">
                        +{r.changePct}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[--state-error] mb-2">Needs attention</p>
                <ul className="space-y-2">
                  {bottomPerformers.map((r) => (
                    <li key={r.id} className="flex items-center justify-between text-sm">
                      <span className="truncate">{r.branch}</span>
                      <span className={`font-mono text-xs shrink-0 ml-2 ${r.changePct >= 0 ? "text-[--state-success]" : "text-[--state-error]"}`}>
                        {r.changePct >= 0 ? "+" : ""}{r.changePct}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-[--border-default]">
                <p className="text-xs text-[--text-muted]">State total · {metricLabels[metric]}</p>
                <p className="font-mono text-lg font-semibold mt-1">
                  {formatMetric(performanceRows.reduce((s, r) => s + r.current, 0))}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Branch Compliance</CardTitle>
            <p className="text-xs text-[--text-muted] mt-0.5">{CURRENT_PERIOD}</p>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
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
                const rep = stReports.find((r) => r.branchId === b.id);
                const rem = stRemits.find((r) => r.branchId === b.id);
                return (
                  <tr key={b.id}>
                    <td className="px-5 py-2.5 truncate">{b.name}</td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={rep?.submittedAt ? rep.status : "Pending"} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={rem?.status ?? "Outstanding"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ---------------------------- BRANCH PASTOR ------------------------------ */
function BranchPastorOverview() {
  const { role, user } = useRole();
  const { weeklyReports, monthlySummaries, branches, tasks } = useMockStore();
  const ctx = { role, user };
  const branch = user.branchId ? branches.find((b) => b.id === user.branchId) ?? findBranch(user.branchId) : undefined;

  if (!branch) {
    return (
      <>
        <PageHeader title="Overview" description="No branch assigned to your account." />
        <Card>
          <CardBody>
            <p className="text-sm text-[--text-muted]">
              Contact your state office to link your account to a branch.
            </p>
          </CardBody>
        </Card>
      </>
    );
  }

  const scopedWeeks = filterWeeklyReports(ctx, weeklyReports, branches);
  const currentWeek = scopedWeeks.find((w) => w.weekEnding === CURRENT_WEEK_ENDING);
  const lastSubmitted = scopedWeeks
    .filter((w) => w.status === "Submitted")
    .sort((a, b) => b.weekEnding.localeCompare(a.weekEnding))[0];
  const lastAttendance = lastSubmitted
    ? lastSubmitted.attendance.adults + lastSubmitted.attendance.youth + lastSubmitted.attendance.children
    : 0;

  const monthly = filterMonthlySummaries(ctx, monthlySummaries, branches).find(
    (m) => m.period === CURRENT_MONTH,
  );
  const monthlyStatusLabel = monthly
    ? monthly.status === "Submitted" || monthly.status === "Approved"
      ? monthly.status
      : `${monthly.weeksSubmitted} of ${monthly.weeksExpected} weeks · summary pending`
    : "Pending";

  const upcoming = filterEvents(ctx, events)
    .filter((e) => e.startDate >= TODAY)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);

  const scopedAnn = filterAnnouncements(ctx, announcements)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 4);

  const pendingTasks = filterTasks(ctx, tasks)
    .filter((t) => t.status !== "Done")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  return (
    <>
      <PageHeader
        title={branch.name}
        description={`Welcome back, Pastor ${user.firstName}. Here's the snapshot for your branch.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Last Sunday Attendance"
          value={lastAttendance}
          hint={lastSubmitted ? `Week ending ${formatDate(lastSubmitted.weekEnding)}` : "No report yet"}
          iconTone="gold"
        />
        <StatCard
          icon={ClipboardList}
          label="This Week's Report"
          value={currentWeek?.status ?? "Pending"}
          iconTone="info"
        />
        <StatCard
          icon={FileBarChart}
          label="Monthly Summary"
          value={monthlyStatusLabel}
          hint={CURRENT_MONTH}
          iconTone="warning"
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
                  <CartesianGrid {...chartGridProps} />
                  <XAxis dataKey="week" {...chartAxisProps} />
                  <YAxis {...chartAxisProps} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke={CHART_COLORS.gold}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: CHART_COLORS.gold }}
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
            <QuickAction to="/dashboard/reports/weekly/submit" icon={ClipboardList} label="Submit Weekly Report" />
            <QuickAction to="/dashboard/reports/monthly" icon={FileBarChart} label="Monthly Summary" />
            <QuickAction to="/dashboard/staff" icon={UserCog} label="Manage Staff" />
            <QuickAction to="/dashboard/leave/apply" icon={CalendarOff} label="Apply for Leave" />
            <QuickAction to="/dashboard/services" icon={Music} label="Service Planner" />
          </CardBody>
        </Card>
      </div>

      {pendingTasks.length > 0 && (
        <Card className="mt-4">
          <CardHeader
            action={
              <Link to="/dashboard/tasks" className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium">
                View all tasks
              </Link>
            }
          >
            <CardTitle>Pending Tasks</CardTitle>
          </CardHeader>
          <ul className="divide-y divide-[--border-default]">
            {pendingTasks.map((t) => (
              <li key={t.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-[--text-muted] mt-0.5">Due {formatDate(t.dueDate)}</p>
                </div>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader
            action={
              <Link
                to="/dashboard/events"
                className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium"
              >
                View calendar
              </Link>
            }
          >
            <div>
              <CardTitle>Calendar Preview</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">Upcoming events</p>
            </div>
          </CardHeader>
          <ul className="divide-y divide-[--border-default]">
            {upcoming.map((e) => (
              <li key={e.id} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-[--text-muted] mt-1">
                      {formatDate(e.startDate)}
                      {e.endDate !== e.startDate && ` – ${formatDate(e.endDate)}`}
                      {e.location && ` · ${e.location}`}
                    </p>
                  </div>
                  <StatusBadge status={e.type} />
                </div>
              </li>
            ))}
            {upcoming.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-[--text-muted]">
                No upcoming events
              </li>
            )}
          </ul>
        </Card>

        <Card>
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
              <CardTitle>Announcements</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">Scoped to your branch & state</p>
            </div>
          </CardHeader>
          <ul className="divide-y divide-[--border-default]">
            {scopedAnn.map((a) => (
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
            {scopedAnn.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-[--text-muted]">
                No announcements
              </li>
            )}
          </ul>
        </Card>
      </div>
    </>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-md border border-[--border-default] px-4 py-3 hover:bg-[--bg-base] hover:border-[--accent-primary]/30 transition-colors"
    >
      <span className="flex items-center gap-2.5 text-sm font-medium">
        <Icon className="h-4 w-4 text-[--accent-primary]" /> {label}
      </span>
      <ChevronRight className="h-4 w-4 text-[--text-muted]" />
    </Link>
  );
}

/* -------------------------------- STAFF ---------------------------------- */
function StaffOverview() {
  const { role, user } = useRole();
  const { tasks } = useMockStore();
  const ctx = { role, user };
  const branch = user.branchId ? findBranch(user.branchId) : undefined;

  const myTasks = filterTasks(ctx, tasks).filter((t) => t.status !== "Done");
  const upcoming = filterEvents(ctx, events)
    .filter((e) => e.startDate >= TODAY)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 4);
  const unreadInbox = filterInbox(ctx, inboxMessages).filter((m) => !m.read);

  const seniorPastor = branch ? findPastor(branch.seniorPastorId) : undefined;

  return (
    <>
      <PageHeader
        title="My Dashboard"
        description={`Welcome, ${user.firstName}. Here's what's happening at your branch.`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={CheckSquare}
          label="Assigned Tasks"
          value={myTasks.length}
          hint={`${myTasks.filter((t) => t.status === "In Progress").length} in progress`}
          iconTone="gold"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming Events"
          value={upcoming.length}
          iconTone="navy"
        />
        <StatCard
          icon={Inbox}
          label="Unread Inbox"
          value={unreadInbox.length}
          iconTone="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {branch && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <div>
                <CardTitle>Branch Info</CardTitle>
                <p className="text-xs text-[--text-muted] mt-0.5">{stateName(branch.stateId)}</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="font-display text-lg font-semibold text-[--text-primary]">
                  {branch.name}
                </p>
                <StatusBadge status={branch.status} />
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5 text-[--text-muted]">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[--accent-primary]" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[--text-muted]">
                  <Phone className="h-4 w-4 shrink-0 text-[--accent-primary]" />
                  <span className="font-mono">{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-[--text-muted]">
                  <Building2 className="h-4 w-4 shrink-0 text-[--accent-primary]" />
                  <span>Est. {branch.foundedYear}</span>
                </div>
                {seniorPastor && (
                  <div className="flex items-center gap-2.5 text-[--text-muted]">
                    <Users className="h-4 w-4 shrink-0 text-[--accent-primary]" />
                    <span>
                      {seniorPastor.firstName} {seniorPastor.lastName} · {seniorPastor.rank}
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        <Card className="lg:col-span-1">
          <CardHeader
            action={
              <Link
                to="/dashboard/tasks"
                className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium"
              >
                View all
              </Link>
            }
          >
            <div>
              <CardTitle>My Tasks</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">Active assignments</p>
            </div>
          </CardHeader>
          <ul className="divide-y divide-[--border-default]">
            {myTasks.slice(0, 5).map((t) => (
              <li key={t.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-[--text-muted] mt-0.5">
                      Due {formatDate(t.dueDate)}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              </li>
            ))}
            {myTasks.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-[--text-muted]">
                No active tasks
              </li>
            )}
          </ul>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader
            action={
              <Link
                to="/dashboard/inbox"
                className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium"
              >
                Open inbox
              </Link>
            }
          >
            <div>
              <CardTitle>Inbox</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">
                {unreadInbox.length} unread
              </p>
            </div>
          </CardHeader>
          <ul className="divide-y divide-[--border-default]">
            {unreadInbox.slice(0, 4).map((m) => (
              <li key={m.id} className="px-5 py-3">
                <p className="text-sm font-medium truncate">{m.subject}</p>
                <p className="text-xs text-[--text-muted] mt-0.5 line-clamp-1">{m.body}</p>
                <p className="text-[11px] text-[--text-muted] mt-1 font-mono">
                  {formatRelative(m.at)}
                </p>
              </li>
            ))}
            {unreadInbox.length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-[--text-muted]">
                Inbox clear
              </li>
            )}
          </ul>
        </Card>
      </div>

      {upcoming.length > 0 && (
        <Card className="mt-4">
          <CardHeader
            action={
              <Link
                to="/dashboard/events"
                className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium"
              >
                View calendar
              </Link>
            }
          >
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[--accent-primary]" />
                Upcoming Events
              </CardTitle>
            </div>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[--border-default]">
            {upcoming.map((e) => (
              <div key={e.id} className="px-5 py-4">
                <p className="text-sm font-medium">{e.name}</p>
                <p className="text-xs text-[--text-muted] mt-1">{formatDate(e.startDate)}</p>
                <p className="text-xs text-[--text-muted] mt-0.5 flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {e.type}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
