import * as React from "react";
import { Link } from "@tanstack/react-router";
import { X, ArrowLeftRight, FileBarChart, Megaphone, CalendarOff, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { notifications as initial } from "@/lib/data/seed";
import { formatRelative } from "@/lib/format";

const iconMap = {
  transfer: { icon: ArrowLeftRight, color: "text-[--state-info] bg-blue-50" },
  report: { icon: FileBarChart, color: "text-[--state-warning] bg-amber-50" },
  announcement: { icon: Megaphone, color: "text-[--bg-sidebar] bg-slate-100" },
  leave: { icon: CalendarOff, color: "text-[--state-success] bg-green-50" },
  remittance: { icon: Wallet, color: "text-[--state-error] bg-red-50" },
} as const;

export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notifs, setNotifs] = React.useState(initial);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const groups = React.useMemo(() => {
    const today: typeof notifs = [];
    const yesterday: typeof notifs = [];
    const earlier: typeof notifs = [];
    const now = new Date("2025-05-13T12:00:00Z").getTime();
    notifs.forEach(n => {
      const diff = now - new Date(n.at).getTime();
      const days = diff / 86400000;
      if (days < 1) today.push(n);
      else if (days < 2) yesterday.push(n);
      else earlier.push(n);
    });
    return { today, yesterday, earlier };
  }, [notifs]);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-[--bg-surface] shadow-2xl border-l border-[--border-default] transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-[--border-default] px-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Notifications</h2>
            <span className="rounded bg-[--bg-base] px-2 py-0.5 text-[11px] font-mono text-[--text-muted]">
              {notifs.filter(n => !n.read).length} new
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setNotifs(notifs.map(n => ({ ...n, read: true })))}
              className="text-xs text-[--accent-primary] hover:text-[--accent-hover] px-2 py-1 rounded font-medium"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[--bg-base] text-[--text-muted]">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-3.5rem)]">
          {(["today", "yesterday", "earlier"] as const).map((key) => {
            const list = groups[key];
            if (!list.length) return null;
            const label = key === "today" ? "Today" : key === "yesterday" ? "Yesterday" : "Earlier this week";
            return (
              <div key={key}>
                <div className="px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-[--text-muted] bg-[--bg-base]/50">
                  {label}
                </div>
                <ul>
                  {list.map(n => {
                    const meta = iconMap[n.type];
                    const Icon = meta.icon;
                    return (
                      <li key={n.id}>
                        <Link
                          to={n.href as any}
                          onClick={() => { setNotifs(notifs.map(x => x.id === n.id ? { ...x, read: true } : x)); onClose(); }}
                          className="flex gap-3 px-5 py-3 hover:bg-[--bg-base] border-b border-[--border-default] last:border-0"
                        >
                          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", meta.color)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm leading-snug", !n.read ? "font-medium text-[--text-primary]" : "text-[--text-muted]")}>
                              {n.message}
                            </p>
                            <p className="text-xs text-[--text-muted] mt-0.5">{formatRelative(n.at)}</p>
                          </div>
                          {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-[--accent-primary] shrink-0" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
