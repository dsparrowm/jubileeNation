import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ScrollText,
  Search,
  ArrowLeftRight,
  FileBarChart,
  CalendarOff,
  Wallet,
  Megaphone,
  CalendarRange,
  Building2,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui-kit/card";
import { Input } from "@/components/ui/input";
import { useMockStore } from "@/lib/data/mock-store";
import { pastorName } from "@/lib/data/seed";
import { formatRelative } from "@/lib/format";
import type { AuditEvent } from "@/lib/data/types";
import { EmptyState } from "@/components/ui-kit/empty-state";

export const Route = createFileRoute("/dashboard/audit")({ component: AuditPage });

const iconMap: Record<AuditEvent["icon"], React.ComponentType<{ className?: string }>> = {
  transfer: ArrowLeftRight,
  report: FileBarChart,
  leave: CalendarOff,
  remit: Wallet,
  announcement: Megaphone,
  event: CalendarRange,
  branch: Building2,
  wallet: Wallet,
};

function AuditPage() {
  const { auditFeed } = useMockStore();
  const [query, setQuery] = React.useState("");
  const [iconFilter, setIconFilter] = React.useState<AuditEvent["icon"] | "all">("all");

  const filtered = auditFeed.filter((ev) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      ev.description.toLowerCase().includes(q) ||
      pastorName(ev.actorId).toLowerCase().includes(q);
    const matchesIcon = iconFilter === "all" || ev.icon === iconFilter;
    return matchesQuery && matchesIcon;
  });

  const iconCounts = auditFeed.reduce(
    (acc, ev) => {
      acc[ev.icon] = (acc[ev.icon] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Searchable trail of platform actions across transfers, reports, and finance."
      />

      <Card>
        <div className="p-4 border-b border-[--border-default]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-muted]" />
            <Input
              placeholder="Search by description or actor…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <FilterChip active={iconFilter === "all"} onClick={() => setIconFilter("all")} label={`All (${auditFeed.length})`} />
            {(Object.keys(iconMap) as AuditEvent["icon"][]).map((icon) => (
              <FilterChip
                key={icon}
                active={iconFilter === icon}
                onClick={() => setIconFilter(icon)}
                label={`${icon} (${iconCounts[icon] ?? 0})`}
              />
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={ScrollText} title="No matching events" description="Try adjusting your search or filter." />
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-sm">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</CardTitle>
            </CardHeader>
            <ul className="divide-y divide-[--border-default] max-h-[calc(100vh-320px)] overflow-y-auto">
              {filtered.map((ev) => {
                const Icon = iconMap[ev.icon] ?? Activity;
                return (
                  <li key={ev.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-[--bg-base]/50 transition-colors">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[--bg-base] text-[--text-muted] shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[--text-primary] leading-snug">{ev.description}</p>
                      <p className="text-xs text-[--text-muted] mt-1">
                        {pastorName(ev.actorId)} · <span className="font-mono">{formatRelative(ev.at)}</span>
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[--text-muted] shrink-0">
                      {ev.icon}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium border capitalize transition-colors ${
        active
          ? "bg-[--accent-primary] text-white border-[--accent-primary]"
          : "bg-[--bg-surface] text-[--text-muted] border-[--border-default] hover:border-[--accent-primary]/40"
      }`}
    >
      {label}
    </button>
  );
}
