import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui-kit/card";
import { Badge, StatusBadge } from "@/components/ui-kit/badges";
import { events, branches, stateName } from "@/lib/data/seed";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/events/$id")({ component: EventDetailPage });

function EventDetailPage() {
  const { id } = Route.useParams();
  const ev = events.find(e => e.id === id);
  if (!ev) return <div className="text-center py-20 text-sm text-[--text-muted]">Event not found.</div>;

  const participating = ev.scope === "Org-Wide" ? branches.slice(0, 8) : ev.scope === "State" ? branches.filter(b => ev.scopeIds.includes(b.stateId)) : branches.filter(b => ev.scopeIds.includes(b.id));

  return (
    <>
      <Link to="/dashboard/events" className="inline-flex items-center gap-1 text-sm text-[--text-muted] hover:text-[--text-primary] mb-3"><ArrowLeft className="h-3.5 w-3.5" /> Back to events</Link>
      <Card>
        <div className="p-6 border-b border-[--border-default]">
          <div className="flex items-center gap-2"><Badge tone="gold">{ev.type}</Badge><Badge tone="neutral">{ev.scope}</Badge></div>
          <h1 className="mt-3 text-2xl font-bold">{ev.name}</h1>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[--accent-primary]" /><span className="font-mono">{formatDate(ev.startDate)} – {formatDate(ev.endDate)}</span></div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[--accent-primary]" />{ev.location}</div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[--accent-primary]" />{ev.organiser}</div>
          </div>
        </div>
        <CardBody>
          <h3 className="text-sm font-semibold mb-1.5">Description</h3>
          <p className="text-sm text-[--text-muted]">{ev.description}</p>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardHeader><div><CardTitle>Participation</CardTitle><p className="text-xs text-[--text-muted] mt-0.5">{participating.length} branches in scope</p></div></CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Branch</th>
                <th className="text-left px-3 py-3 font-medium">State</th>
                <th className="text-left px-3 py-3 font-medium">Registered</th>
                <th className="text-left px-3 py-3 font-medium">Attendance Submitted</th>
                <th className="text-left px-5 py-3 font-medium">Post-Event Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border-default]">
              {participating.map((b, i) => (
                <tr key={b.id}>
                  <td className="px-5 py-3 font-medium">{b.name}</td>
                  <td className="px-3 py-3 text-[--text-muted]">{stateName(b.stateId)}</td>
                  <td className="px-3 py-3"><StatusBadge status={i % 3 === 0 ? "Pending" : "Submitted"} /></td>
                  <td className="px-3 py-3"><StatusBadge status={i % 4 === 0 ? "Pending" : "Submitted"} /></td>
                  <td className="px-5 py-3"><StatusBadge status={i % 5 === 0 ? "Pending" : "Submitted"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
