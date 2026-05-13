import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { leaveRequests, pastorName, findPastor, branchName, stateName } from "@/lib/data/seed";
import { formatDate, daysBetween, initials } from "@/lib/format";

export const Route = createFileRoute("/dashboard/leave/")({ component: LeavePage });

const leaveTypeColor: Record<string, string> = {
  Annual: "bg-[--state-info]",
  Medical: "bg-[--state-error]",
  Compassionate: "bg-[--state-warning]",
  Sabbatical: "bg-purple-600",
};

function LeavePage() {
  return (
    <>
      <PageHeader title="Leave Management" description="Pastoral leave requests across the organisation."
        actions={<Link to="/dashboard/leave/apply"><Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" size="sm"><Plus className="h-4 w-4 mr-1.5" /> Apply for Leave</Button></Link>}
      />
      <Tabs defaultValue="requests">
        <TabsList className="bg-[--bg-surface] border border-[--border-default]">
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="calendar">Absence Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Pastor</th>
                    <th className="text-left px-3 py-3 font-medium">Branch</th>
                    <th className="text-left px-3 py-3 font-medium">Type</th>
                    <th className="text-left px-3 py-3 font-medium">From</th>
                    <th className="text-left px-3 py-3 font-medium">To</th>
                    <th className="text-right px-3 py-3 font-medium">Days</th>
                    <th className="text-left px-3 py-3 font-medium">Status</th>
                    <th className="text-right px-5 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border-default]">
                  {leaveRequests.map(l => {
                    const p = findPastor(l.pastorId)!;
                    return (
                      <tr key={l.id} className="hover:bg-[--bg-base]/50">
                        <td className="px-5 py-3 font-medium">{pastorName(l.pastorId)}</td>
                        <td className="px-3 py-3 text-[--text-muted]">{branchName(p.branchId)}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${leaveTypeColor[l.type]}`} />{l.type}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs">{formatDate(l.fromDate)}</td>
                        <td className="px-3 py-3 font-mono text-xs">{formatDate(l.toDate)}</td>
                        <td className="px-3 py-3 text-right font-mono">{daysBetween(l.fromDate, l.toDate)}</td>
                        <td className="px-3 py-3"><StatusBadge status={l.status} /></td>
                        <td className="px-5 py-3 text-right">
                          {l.status === "Pending" ? (
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="outline" className="h-7 text-xs text-[--state-success]">Approve</Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs text-[--state-error]">Reject</Button>
                            </div>
                          ) : <button className="text-xs text-[--accent-primary] font-medium">View</button>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <Card className="lg:col-span-3">
              <div className="p-4">
                <div className="text-sm font-semibold mb-3">May 2025</div>
                <div className="grid grid-cols-7 gap-px bg-[--border-default] rounded-md overflow-hidden text-xs">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                    <div key={d} className="bg-[--bg-base] py-2 text-center font-medium text-[--text-muted]">{d}</div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 2; // start offset
                    const dayLeaves = day > 0 && day <= 31
                      ? leaveRequests.filter(l => {
                          const d = new Date(`2025-05-${String(day).padStart(2, "0")}`);
                          return d >= new Date(l.fromDate) && d <= new Date(l.toDate) && l.status !== "Rejected";
                        })
                      : [];
                    return (
                      <div key={i} className="bg-white p-1.5 min-h-[72px]">
                        {day > 0 && day <= 31 && <div className="text-[10px] text-[--text-muted] font-mono">{day}</div>}
                        <div className="mt-1 flex flex-wrap gap-0.5">
                          {dayLeaves.slice(0, 3).map(l => {
                            const p = findPastor(l.pastorId)!;
                            return (
                              <div key={l.id} title={`${p.firstName} ${p.lastName} — ${l.type}`} className={`h-4 w-4 rounded-full ${leaveTypeColor[l.type]} text-white text-[8px] flex items-center justify-center font-bold`}>
                                {p.firstName[0]}
                              </div>
                            );
                          })}
                          {dayLeaves.length > 3 && <div className="text-[9px] text-[--text-muted]">+{dayLeaves.length - 3}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
            <Card className="lg:col-span-1">
              <div className="p-4">
                <div className="text-sm font-semibold mb-3">Legend</div>
                <ul className="space-y-2 text-sm">
                  {Object.entries(leaveTypeColor).map(([type, cls]) => (
                    <li key={type} className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${cls}`} />{type}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
