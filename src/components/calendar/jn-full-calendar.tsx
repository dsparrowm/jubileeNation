import type { EventInput } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import * as React from "react";
import { cn } from "@/lib/utils";

export type JnCalendarEventType = "event" | "leave" | "report" | "remittance";

export interface JnCalendarEvent extends EventInput {
  extendedProps: {
    type: JnCalendarEventType;
    description?: string;
  };
}

interface JnFullCalendarProps {
  events: JnCalendarEvent[];
  initialDate?: string;
  onEventClick?: (event: JnCalendarEvent) => void;
  onDateClick?: (dateStr: string) => void;
  className?: string;
}

/** FullCalendar uses exclusive end dates for all-day events */
export function exclusiveEndDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function JnFullCalendar({
  events,
  initialDate = "2025-05-13",
  onEventClick,
  onDateClick,
  className,
}: JnFullCalendarProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("fc-skeleton min-h-[620px] rounded-xl bg-[--bg-subtle] animate-pulse", className)} />
    );
  }

  return (
    <div className={cn("jn-fullcalendar", className)}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={initialDate}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,listWeek",
        }}
        events={events}
        height="auto"
        fixedWeekCount={false}
        firstDay={1}
        eventDisplay="block"
        dayMaxEvents={3}
        moreLinkClick="popover"
        nowIndicator
        navLinks
        editable={false}
        selectable
        dateClick={(info) => onDateClick?.(info.dateStr)}
        eventClick={(info) => {
          const ev = info.event;
          onEventClick?.({
            id: ev.id,
            title: ev.title,
            start: ev.startStr || undefined,
            end: ev.endStr || undefined,
            allDay: ev.allDay,
            backgroundColor: ev.backgroundColor,
            borderColor: ev.borderColor,
            extendedProps: ev.extendedProps as JnCalendarEvent["extendedProps"],
          });
        }}
        eventTimeFormat={{ hour: "2-digit", minute: "2-digit", meridiem: false }}
      />
    </div>
  );
}
