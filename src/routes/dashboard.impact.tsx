import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Users, Heart, Droplets } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import {
  ministryImpactByState,
  salvationsTrend,
} from "@/lib/data/seed";
import {
  CHART_COLORS,
  chartTooltipStyle,
  chartGridProps,
  chartAxisProps,
  CHART_PALETTE,
} from "@/components/ui-kit/chart-theme";

export const Route = createFileRoute("/dashboard/impact")({ component: ImpactPage });

function ImpactPage() {
  const impactData = ministryImpactByState();
  const trendData = salvationsTrend();

  const totalAttendance = impactData.reduce((s, d) => s + d.attendance, 0);
  const totalSalvations = impactData.reduce((s, d) => s + d.salvations, 0);
  const totalBaptisms = impactData.reduce((s, d) => s + d.baptisms, 0);
  const avgGrowth = Math.round(impactData.reduce((s, d) => s + d.growth, 0) / impactData.length);

  return (
    <>
      <PageHeader
        title="Ministry Impact"
        description="Salvations, baptisms, and attendance growth across all states — April 2025."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Attendance" value={totalAttendance.toLocaleString()} iconTone="navy" />
        <StatCard icon={Heart} label="Salvations" value={totalSalvations} iconTone="gold" trend={{ dir: "up", value: "+18%" }} />
        <StatCard icon={Droplets} label="Baptisms" value={totalBaptisms} iconTone="info" />
        <StatCard icon={TrendingUp} label="Avg Growth" value={`${avgGrowth}%`} iconTone="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Impact by State</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">Attendance, salvations & baptisms</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={impactData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis dataKey="state" {...chartAxisProps} />
                  <YAxis {...chartAxisProps} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="attendance" fill={CHART_COLORS.navy} name="Attendance" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="salvations" fill={CHART_COLORS.gold} name="Salvations" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="baptisms" fill={CHART_COLORS.info} name="Baptisms" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Salvations & Baptisms Trend</CardTitle>
              <p className="text-xs text-[--text-muted] mt-0.5">Last 6 months · organisation-wide</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="salvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.gold} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={CHART_COLORS.gold} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="baptGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.info} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={CHART_COLORS.info} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis dataKey="month" {...chartAxisProps} />
                  <YAxis {...chartAxisProps} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="salvations" stroke={CHART_COLORS.gold} strokeWidth={2.5} fill="url(#salvGrad)" name="Salvations" />
                  <Area type="monotone" dataKey="baptisms" stroke={CHART_COLORS.info} strokeWidth={2} fill="url(#baptGrad)" name="Baptisms" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Growth Rate by State</CardTitle>
            <p className="text-xs text-[--text-muted] mt-0.5">Year-over-year attendance growth %</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-64">
            <ResponsiveContainer>
              <ComposedChart data={impactData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="state" {...chartAxisProps} />
                <YAxis {...chartAxisProps} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => `${v}%`} />
                <Bar dataKey="growth" fill={CHART_COLORS.success} name="Growth %" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="growth" stroke={CHART_PALETTE[1]} strokeWidth={2} dot={{ r: 4 }} name="Trend" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>State Rankings</CardTitle></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
              <tr>
                <th className="text-left px-5 py-3 font-medium">#</th>
                <th className="text-left px-3 py-3 font-medium">State</th>
                <th className="text-right px-3 py-3 font-medium">Attendance</th>
                <th className="text-right px-3 py-3 font-medium">Salvations</th>
                <th className="text-right px-3 py-3 font-medium">Baptisms</th>
                <th className="text-right px-5 py-3 font-medium">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-default]">
              {[...impactData].sort((a, b) => b.salvations - a.salvations).map((row, i) => (
                <tr key={row.state} className="hover:bg-[--bg-base]/50">
                  <td className="px-5 py-3 font-mono text-xs text-[--text-muted]">{i + 1}</td>
                  <td className="px-3 py-3 font-medium">{row.state}</td>
                  <td className="px-3 py-3 text-right font-mono">{row.attendance.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-mono text-[--accent-primary]">{row.salvations}</td>
                  <td className="px-3 py-3 text-right font-mono">{row.baptisms}</td>
                  <td className="px-5 py-3 text-right font-mono text-[--state-success]">+{row.growth}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
