import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Calendar, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-kit/badges";
import { events } from "@/lib/data/seed";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/events/")({ component: EventsPage });

const typeTone: Record<string, "gold" | "info" | "indigo" | "purple" | "success"> = {
  Convention: "gold", Retreat: "indigo", Crusade: "purple", Training: "info", Service: "success",
};

function EventsPage() {
  const [view, setView] = React.useState<"grid" | "calendar">("grid");

  return (
    <>
      <PageHeader title="Events & Programmes" description="Upcoming gatherings, conventions, and training across the org."
        actions={<Button className="bg-[--accent-primary] hover:bg-[--accent-hover] text-white" size="sm"><Plus className="h-4 w-4 mr-1.5" /> Create Event</Button>}
      />
      <div className="flex items-center gap-1 mb-4 bg-[--bg-surface] border border-[--border-default] rounded-md p-1 w-fit">
        {(["grid", "calendar"] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs font-medium rounded ${view === v ? "bg-[--bg-base] text-[--text-primary]" : "text-[--text-muted]"}`}>
            {v === "grid" ? "Grid" : "Calendar"}
          </button>
        ))}
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => (
            <Link key={ev.id} to="/dashboard/events/$id" params={{ id: ev.id }} className="group">
              <Card className="hover:border-[--accent-primary]/40 hover:shadow-md transition h-full">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone={typeTone[ev.type]}>{ev.type}</Badge>
                    <Badge tone="neutral">{ev.scope}</Badge>
                  </div>
                  <h3 className="mt-3 text-base font-semibold leading-snug">{ev.name}</h3>
                  <div className="mt-3 space-y-1.5 text-xs text-[--text-muted]">
                    <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /><span className="font-mono">{formatDate(ev.startDate)}{ev.startDate !== ev.endDate && ` – ${formatDate(ev.endDate)}`}</span></div>
                    <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{ev.location}</div>
                    <div className="flex items-center gap-1.5"><Users className="h-3 w-3" />{ev.organiser}</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="p-4">
            <div className="text-sm font-semibold mb-3">Upcoming · 2025</div>
            <div className="space-y-2">
              {events.map(ev => (
                <div key={ev.id} className="flex items-center gap-4 p-3 rounded-md border border-[--border-default] hover:bg-[--bg-base]/50">
                  <div className="text-center shrink-0 w-14">
                    <div className="text-[10px] uppercase text-[--accent-primary] font-semibold">{new Date(ev.startDate).toLocaleString("en", { month: "short" })}</div>
                    <div className="font-mono text-xl font-bold">{new Date(ev.startDate).getDate()}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{ev.name}</div>
                    <div className="text-xs text-[--text-muted]">{ev.location}</div>
                  </div>
                  <Badge tone={typeTone[ev.type]}>{ev.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
