import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart, CalendarOff, CalendarRange, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { useRole } from "@/lib/role-context";
import { filterEvents, filterBranches, filterLeaveByState } from "@/lib/data/filters";
import {
  events,
  branches,
  complianceSnapshots,
  branchName,
  findPastor,
} from "@/lib/data/seed";
import { useMockStore } from "@/lib/data/mock-store";
import { formatDate } from "@/lib/format";
import {
  JnFullCalendar,
  exclusiveEndDate,
  type JnCalendarEvent,
  type JnCalendarEventType,
} from "@/components/calendar/jn-full-calendar";

export const Route = createFileRoute("/dashboard/calendar")({ component: CalendarPage });

const TYPE_META: Record<
  JnCalendarEventType,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  event: { icon: CalendarRange, color: "#C9A050", label: "Events" },
  leave: { icon: CalendarOff, color: "#D97706", label: "Leave" },
  report: { icon: FileBarChart, color: "#DC2626", label: "Report due" },
  remittance: { icon: Wallet, color: "#2563EB", label: "Remittance due" },
};

function buildCalendarEvents(ctx: { role: ReturnType<typeof useRole>["role"]; user: ReturnType<typeof useRole>["user"] }, leaveRequests: typeof import("@/lib/data/seed").leaveRequests): JnCalendarEvent[] {
  const scopedEvents = filterEvents(ctx, events);
  const scopedBranchIds = new Set(filterBranches(ctx, branches).map((b) => b.id));
  const scopedLeave = filterLeaveByState(ctx, leaveRequests, (id) => findPastor(id)?.stateId);
  const items: JnCalendarEvent[] = [];

  scopedEvents.forEach((e) => {
    const multiDay = e.endDate !== e.startDate;
    items.push({
      id: e.id,
      title: e.name,
      start: e.startDate,
      end: multiDay ? exclusiveEndDate(e.endDate) : undefined,
      allDay: true,
      backgroundColor: TYPE_META.event.color,
      borderColor: TYPE_META.event.color,
      extendedProps: { type: "event", description: e.location },
    });
  });

  scopedLeave.forEach((l) => {
    if (l.status === "Rejected") return;
    const p = findPastor(l.pastorId);
    items.push({
      id: l.id,
      title: `${p?.firstName ?? "Pastor"} — ${l.type} leave`,
      start: l.fromDate,
      end: exclusiveEndDate(l.toDate),
      allDay: true,
      backgroundColor: TYPE_META.leave.color,
      borderColor: TYPE_META.leave.color,
      extendedProps: { type: "leave", description: l.reason },
    });
  });

  complianceSnapshots.forEach((c) => {
    if (!scopedBranchIds.has(c.branchId)) return;
    items.push({
      id: `rep-${c.branchId}`,
      title: `Report due: ${branchName(c.branchId)}`,
      start: c.reportDue,
      allDay: true,
      backgroundColor: TYPE_META.report.color,
      borderColor: TYPE_META.report.color,
      extendedProps: { type: "report", description: c.period },
    });
    items.push({
      id: `rem-${c.branchId}`,
      title: `Remit due: ${branchName(c.branchId)}`,
      start: c.remitDue,
      allDay: true,
      backgroundColor: TYPE_META.remittance.color,
      borderColor: TYPE_META.remittance.color,
      extendedProps: { type: "remittance", description: c.period },
    });
  });

  return items;
}

function CalendarPage() {
  const { role, user } = useRole();
  const { leaveRequests } = useMockStore();
  const ctx = { role, user };

  const calEvents = React.useMemo(
    () => buildCalendarEvents(ctx, leaveRequests),
    [role, user, leaveRequests],
  );

  const scopedEvents = filterEvents(ctx, events);
  const [selectedDate, setSelectedDate] = React.useState("2025-05-13");
  const [selectedEvent, setSelectedEvent] = React.useState<JnCalendarEvent | null>(null);

  const dayEvents = calEvents.filter((e) => {
    const start = String(e.start).slice(0, 10);
    const end = e.end ? String(e.end).slice(0, 10) : exclusiveEndDate(start);
    return selectedDate >= start && selectedDate < end;
  });

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Events, leave blocks, and reporting deadlines across the organisation."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3" variant="elevated">
          <CardBody className="pt-4">
            <JnFullCalendar
              events={calEvents}
              initialDate="2025-05-13"
              onDateClick={(dateStr) => {
                setSelectedDate(dateStr);
                setSelectedEvent(null);
              }}
              onEventClick={(event) => {
                setSelectedEvent(event);
                if (event.start) setSelectedDate(String(event.start).slice(0, 10));
              }}
            />
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardBody className="pt-0 space-y-2 text-sm">
              {(Object.keys(TYPE_META) as JnCalendarEventType[]).map((key) => {
                const meta = TYPE_META[key];
                const Icon = meta.icon;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <Icon className="h-3.5 w-3.5 text-[--text-muted]" />
                    {meta.label}
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{formatDate(selectedDate)}</CardTitle>
            </CardHeader>
            <CardBody className="pt-0">
              {selectedEvent ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{selectedEvent.title}</p>
                  {selectedEvent.extendedProps?.description && (
                    <p className="text-xs text-[--text-muted]">{selectedEvent.extendedProps.description}</p>
                  )}
                </div>
              ) : dayEvents.length === 0 ? (
                <p className="text-sm text-[--text-muted]">No items on this day.</p>
              ) : (
                <ul className="space-y-2">
                  {dayEvents.map((e) => {
                    const type = e.extendedProps?.type ?? "event";
                    const Icon = TYPE_META[type].icon;
                    return (
                      <li key={String(e.id)} className="flex items-start gap-2 text-sm">
                        <Icon className="h-4 w-4 shrink-0 mt-0.5 text-[--text-muted]" />
                        <span>{e.title}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upcoming Events</CardTitle>
            </CardHeader>
            <ul className="divide-y divide-[--border-default]">
              {scopedEvents.slice(0, 4).map((e) => (
                <li key={e.id} className="px-5 py-3">
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className="text-xs text-[--text-muted] mt-0.5 font-mono">
                    {formatDate(e.startDate)}
                    {e.endDate !== e.startDate ? ` – ${formatDate(e.endDate)}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
