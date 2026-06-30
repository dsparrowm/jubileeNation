import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, Download, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/ui-kit/data-table";
import {
  reports,
  branches,
  states,
  stateName,
} from "@/lib/data/seed";
import {
  CHART_COLORS,
  chartTooltipStyle,
  chartGridProps,
  chartAxisProps,
} from "@/components/ui-kit/chart-theme";

export const Route = createFileRoute("/dashboard/reports/builder")({ component: ReportsBuilderPage });

type Period = "Mar 2025" | "Apr 2025";
type MetricKey = "attendance" | "salvations" | "baptisms" | "offering";

interface ComparisonRow {
  id: string;
  branch: string;
  state: string;
  current: number;
  previous: number;
  change: number;
  changePct: number;
}

function ReportsBuilderPage() {
  const [period, setPeriod] = React.useState<Period>("Apr 2025");
  const [comparePeriod, setComparePeriod] = React.useState<Period>("Mar 2025");
  const [metric, setMetric] = React.useState<MetricKey>("attendance");
  const [stateFilter, setStateFilter] = React.useState<string>("all");

  const prevPeriod = comparePeriod;

  const getMetricValue = (branchId: string, p: string, m: MetricKey): number => {
    const r = reports.find((rp) => rp.branchId === branchId && rp.period === p);
    if (!r) return 0;
    if (m === "attendance") return r.attendance.adults + r.attendance.youth + r.attendance.children;
    if (m === "salvations") return r.salvations;
    if (m === "baptisms") return r.baptisms;
    return r.offering;
  };

  let branchList = branches;
  if (stateFilter !== "all") {
    branchList = branches.filter((b) => b.stateId === stateFilter);
  }

  const rows: ComparisonRow[] = branchList.map((b) => {
    const current = getMetricValue(b.id, period, metric);
    const previous = getMetricValue(b.id, prevPeriod, metric);
    const change = current - previous;
    const changePct = previous > 0 ? Math.round((change / previous) * 100) : 0;
    return {
      id: b.id,
      branch: b.name,
      state: stateName(b.stateId),
      current,
      previous,
      change,
      changePct,
    };
  });

  const chartData = states.map((s) => {
    const stBranches = branches.filter((b) => b.stateId === s.id);
    const current = stBranches.reduce((sum, b) => sum + getMetricValue(b.id, period, metric), 0);
    const previous = stBranches.reduce((sum, b) => sum + getMetricValue(b.id, prevPeriod, metric), 0);
    return { state: s.name, current, previous };
  });

  const totalCurrent = rows.reduce((s, r) => s + r.current, 0);
  const totalPrevious = rows.reduce((s, r) => s + r.previous, 0);
  const overallChange = totalPrevious > 0 ? Math.round(((totalCurrent - totalPrevious) / totalPrevious) * 100) : 0;

  const metricLabel: Record<MetricKey, string> = {
    attendance: "Attendance",
    salvations: "Salvations",
    baptisms: "Baptisms",
    offering: "Offering (₦)",
  };

  const columns: Column<ComparisonRow>[] = [
    { key: "branch", header: "Branch", sortable: true, cell: (r) => <span className="font-medium">{r.branch}</span> },
    { key: "state", header: "State", cell: (r) => <span className="text-[--text-muted]">{r.state}</span> },
    {
      key: "previous",
      header: prevPeriod,
      cell: (r) => <span className="font-mono text-xs">{metric === "offering" ? `₦${r.previous.toLocaleString()}` : r.previous.toLocaleString()}</span>,
    },
    {
      key: "current",
      header: period,
      cell: (r) => <span className="font-mono text-xs font-semibold">{metric === "offering" ? `₦${r.current.toLocaleString()}` : r.current.toLocaleString()}</span>,
    },
    {
      key: "change",
      header: "Change",
      sortable: true,
      cell: (r) => (
        <span className={`font-mono text-xs font-semibold ${r.change >= 0 ? "text-[--state-success]" : "text-[--state-error]"}`}>
          {r.change >= 0 ? "+" : ""}{metric === "offering" ? `₦${r.change.toLocaleString()}` : r.change} ({r.changePct}%)
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reports Builder"
        description="Build custom period-over-period comparisons across branches and states."
        actions={
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs font-medium text-[--text-muted] block mb-1">Current Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className="rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-2 text-sm"
            >
              <option value="Mar 2025">Mar 2025</option>
              <option value="Apr 2025">Apr 2025</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted] block mb-1">Compare To</label>
            <select
              value={comparePeriod}
              onChange={(e) => setComparePeriod(e.target.value as Period)}
              className="rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-2 text-sm"
            >
              <option value="Mar 2025">Mar 2025</option>
              <option value="Apr 2025">Apr 2025</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted] block mb-1">Metric</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as MetricKey)}
              className="rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-2 text-sm"
            >
              <option value="attendance">Attendance</option>
              <option value="salvations">Salvations</option>
              <option value="baptisms">Baptisms</option>
              <option value="offering">Offering</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted] block mb-1">State</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-2 text-sm"
            >
              <option value="all">All States</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" size="sm">
            <BarChart3 className="h-4 w-4 mr-1.5" /> Generate
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <StatCard icon={FileSpreadsheet} label={`${period} Total`} value={metric === "offering" ? `₦${(totalCurrent / 1e6).toFixed(1)}M` : totalCurrent.toLocaleString()} iconTone="gold" />
        <StatCard icon={FileSpreadsheet} label={`${prevPeriod} Total`} value={metric === "offering" ? `₦${(totalPrevious / 1e6).toFixed(1)}M` : totalPrevious.toLocaleString()} iconTone="navy" />
        <StatCard icon={BarChart3} label="Period Change" value={`${overallChange >= 0 ? "+" : ""}${overallChange}%`} iconTone={overallChange >= 0 ? "success" : "error"} />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>{metricLabel[metric]} by State</CardTitle>
            <p className="text-xs text-[--text-muted] mt-0.5">{period} vs {prevPeriod}</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="state" {...chartAxisProps} />
                <YAxis {...chartAxisProps} tickFormatter={(v) => metric === "offering" ? `₦${(v / 1e6).toFixed(1)}M` : String(v)} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => metric === "offering" ? `₦${v.toLocaleString()}` : v.toLocaleString()} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="previous" fill={CHART_COLORS.navy} name={prevPeriod} radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" fill={CHART_COLORS.gold} name={period} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle>Branch Comparison · {metricLabel[metric]}</CardTitle></CardHeader>
        <div className="px-1 pb-1">
          <DataTable columns={columns} data={rows} keyFn={(r) => r.id} />
        </div>
      </Card>
    </>
  );
}
