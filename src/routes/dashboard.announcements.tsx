import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui-kit/badges";
import { announcements, pastorName, stateName, branchName, pastors } from "@/lib/data/seed";
import { formatDateTime, formatDate, initials } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/role-context";

export const Route = createFileRoute("/dashboard/announcements")({ component: AnnouncementsPage });

function AnnouncementsPage() {
  const [activeId, setActiveId] = React.useState(announcements[0].id);
  const active = announcements.find(a => a.id === activeId)!;
  const recipients = pastors.slice(0, Math.min(20, active.recipientCount));

  return (
    <>
      <PageHeader title="Announcements" description="Org-wide and scoped communications."
        actions={<Button className="bg-[--accent-primary] hover:bg-[--accent-hover] text-white" size="sm"><Plus className="h-4 w-4 mr-1.5" /> New Announcement</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <ul className="divide-y divide-[--border-default]">
            {announcements.map(a => {
              const isActive = a.id === activeId;
              return (
                <li key={a.id}>
                  <button onClick={() => setActiveId(a.id)} className={`w-full text-left px-4 py-3 hover:bg-[--bg-base]/60 ${isActive ? "bg-[--bg-base]" : ""} relative`}>
                    {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[--accent-primary]" />}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug">{a.title}</p>
                      {a.priority === "Urgent" && <StatusBadge status="Urgent" />}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[--text-muted]">
                      <Badge tone={a.scope === "All" ? "gold" : a.scope === "State" ? "info" : "neutral"}>
                        {a.scope === "All" ? "All branches" : a.scope === "State" ? stateName(a.scopeId) : branchName(a.scopeId)}
                      </Badge>
                      <span className="font-mono">{formatDate(a.publishedAt)}</span>
                    </div>
                    <div className="mt-1 text-[11px] text-[--text-muted] font-mono">{a.readBy.length}/{a.recipientCount} read</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <div className="p-6 border-b border-[--border-default]">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold">{active.title}</h2>
              {active.priority === "Urgent" && <StatusBadge status="Urgent" />}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-[--text-muted]">
              <span>{pastorName(active.senderId)}</span>
              <span>·</span>
              <span>{ROLE_LABELS[active.senderRole]}</span>
              <span>·</span>
              <span className="font-mono">{formatDateTime(active.publishedAt)}</span>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-[--text-primary] leading-relaxed whitespace-pre-line">{active.body}</p>
          </div>
          <div className="border-t border-[--border-default]">
            <div className="px-6 py-3 text-sm font-semibold">Recipients <span className="text-xs text-[--text-muted] font-normal font-mono">({active.readBy.length}/{active.recipientCount})</span></div>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-sm">
                <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
                  <tr>
                    <th className="text-left px-6 py-2 font-medium">Name</th>
                    <th className="text-left px-3 py-2 font-medium">Branch</th>
                    <th className="text-left px-6 py-2 font-medium">Read</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border-default]">
                  {recipients.map(p => {
                    const read = active.readBy.includes(p.id);
                    return (
                      <tr key={p.id}>
                        <td className="px-6 py-2 flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-[10px] font-semibold">{initials(p.firstName, p.lastName)}</div>
                          {p.firstName} {p.lastName}
                        </td>
                        <td className="px-3 py-2 text-[--text-muted]">{branchName(p.branchId)}</td>
                        <td className="px-6 py-2">{read ? <span className="text-xs text-[--state-success] font-mono">Read</span> : <span className="text-xs text-[--text-muted]">Not yet read</span>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
