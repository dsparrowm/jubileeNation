import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Building2, Users, MapPin, TrendingUp, FileBarChart, ArrowLeftRight, ArrowRight } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import {
  states, branches, pastors, transfers, attendanceByStateAll,
  remittanceComplianceTrend, reportSubmissionByState, branchName, pastorName, reports, remittances,
} from "@/lib/data/seed";
import { naira, formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/analytics")({ component: AnalyticsPage });

const RANK_COLORS = ["#94A3B8", "#2563EB", "#4F46E5", "#7C3AED", "#C9A050"];
const RANKS = ["Deacon", "Pastor", "Senior Pastor", "Zonal Pastor", "State Pastor"];

function AnalyticsPage() {
  const ranksData = RANKS.map(r => ({ name: r, value: pastors.filter(p => p.rank === r).length }));
  const compliantApril = remittances.filter(r => r.period === "Apr 2025" && r.status === "Compliant").length;
  const submittedApril = reports.filter(r => r.period === "Apr 2025" && r.submittedAt).length;
  const totalAttendance = reports.filter(r => r.period === "Apr 2025" && r.submittedAt).reduce((s, r) => s + r.attendance.adults + r.attendance.youth + r.attendance.children, 0);
  const avgAttendance = Math.round(totalAttendance / Math.max(submittedApril, 1));

  const topBranches = [...branches].slice(0, 8).map((b, i) => {
    const r = reports.find(rp => rp.branchId === b.id && rp.period === "Apr 2025");
    const rem = remittances.filter(rm => rm.branchId === b.id);
    const compliancePct = Math.round((rem.filter(x => x.status === "Compliant").length / rem.length) * 100);
    return {
      ...b,
      attendance: r ? r.attendance.adults + r.attendance.youth + r.attendance.children : 0,
      compliance: compliancePct,
      growth: 4 + ((i * 7) % 18),
    };
  }).sort((a, b) => b.attendance - a.attendance);

  const recentTransfers = transfers.slice(0, 6);

  return (
    <>
      <PageHeader title="Executive Analytics" description="Cross-organisational performance signals at a glance." />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={MapPin} label="States" value={states.length} iconTone="navy" />
        <StatCard icon={Building2} label="Branches" value={branches.length} iconTone="gold" />
        <StatCard icon={Users} label="Pastoral Staff" value={pastors.length} iconTone="info" />
        <StatCard icon={TrendingUp} label="Avg Attendance" value={avgAttendance} iconTone="success" />
        <StatCard icon={FileBarChart} label="Remit Compliance" value={`${Math.round(compliantApril / branches.length * 100)}%`} iconTone="warning" />
        <StatCard icon={ArrowLeftRight} label="Open Transfers" value={transfers.filter(t => t.status === "Pending").length} iconTone="error" />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <CardHeader><div><CardTitle>Attendance by State</CardTitle><p className="text-xs text-[--text-muted] mt-0.5">Last 6 months · Top 5 states</p></div></CardHeader>
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={attendanceByStateAll()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={11} />
                  <YAxis stroke="#6B7280" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {states.slice(0, 5).map((s, i) => (
                    <Bar key={s.id} dataKey={s.name} fill={["#C9A050", "#0D1B3E", "#2563EB", "#16A34A", "#7C3AED"][i]} radius={[3, 3, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><div><CardTitle>Pastoral Staff by Rank</CardTitle></div></CardHeader>
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={ranksData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={2}>
                    {ranksData.map((_, i) => <Cell key={i} fill={RANK_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <CardHeader><div><CardTitle>Remittance Compliance Trend</CardTitle><p className="text-xs text-[--text-muted] mt-0.5">Last 12 months</p></div></CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={remittanceComplianceTrend()}>
                  <defs>
                    <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A050" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#C9A050" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" stroke="#6B7280" fontSize={11} />
                  <YAxis stroke="#6B7280" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v}%`} />
                  <Area type="monotone" dataKey="compliance" stroke="#C9A050" strokeWidth={2.5} fill="url(#gold)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><div><CardTitle>Top Performing Branches</CardTitle></div></CardHeader>
          <ul className="divide-y divide-[--border-default]">
            {topBranches.slice(0, 6).map((b, i) => (
              <li key={b.id} className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="font-mono text-xs text-[--text-muted] w-5">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{b.name}</div>
                    <div className="text-[11px] text-[--text-muted] font-mono">{b.attendance} att · {b.compliance}% compliance</div>
                  </div>
                  <span className="text-xs text-[--state-success] font-mono">+{b.growth}%</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader><div><CardTitle>Report Submission Rate by State</CardTitle><p className="text-xs text-[--text-muted] mt-0.5">April 2025</p></div></CardHeader>
          <CardBody>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={reportSubmissionByState()} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" stroke="#6B7280" fontSize={11} />
                  <YAxis type="category" dataKey="state" stroke="#6B7280" fontSize={11} width={70} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="total" fill="#E5E9F2" name="Total" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="submitted" fill="#16A34A" name="Submitted" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><div><CardTitle>Recent Transfers</CardTitle></div></CardHeader>
          <ul className="divide-y divide-[--border-default]">
            {recentTransfers.map(t => (
              <li key={t.id} className="px-5 py-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="font-medium min-w-0 flex-1 truncate">{pastorName(t.pastorId)}</div>
                  <span className="text-[11px] text-[--text-muted] font-mono">{formatDate(t.effectiveDate)}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-[--text-muted]">
                  <span className="truncate">{branchName(t.fromBranchId)}</span>
                  <ArrowRight className="h-3 w-3 text-[--accent-primary] shrink-0" />
                  <span className="truncate text-[--text-primary]">{branchName(t.toBranchId)}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
