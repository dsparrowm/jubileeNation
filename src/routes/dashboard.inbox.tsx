import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Inbox, Mail, MailOpen, Star } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { StatCard } from "@/components/ui-kit/stat-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { useRole } from "@/lib/role-context";
import { filterInbox } from "@/lib/data/filters";
import { inboxMessages, pastorName } from "@/lib/data/seed";
import { formatRelative } from "@/lib/format";
import type { InboxMessage } from "@/lib/data/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/dashboard/inbox")({ component: InboxPage });

function InboxPage() {
  const { role, user } = useRole();
  const [messages, setMessages] = React.useState<InboxMessage[]>(() => [...inboxMessages]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<"all" | "unread" | "read">("all");

  const scoped = filterInbox({ role, user }, messages);
  const filtered =
    filter === "all" ? scoped : scoped.filter((m) => (filter === "unread" ? !m.read : m.read));

  const unread = scoped.filter((m) => !m.read).length;
  const selected = filtered.find((m) => m.id === selectedId) ?? filtered[0] ?? null;

  const markRead = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const markAllRead = () => {
    setMessages((prev) =>
      prev.map((m) => (scoped.some((s) => s.id === m.id) ? { ...m, read: true } : m)),
    );
  };

  React.useEffect(() => {
    if (selected && !selected.read) markRead(selected.id);
  }, [selected?.id]);

  return (
    <>
      <PageHeader
        title="Inbox"
        description="Direct messages and role-based communications."
        actions={
          unread > 0 ? (
            <Button size="sm" variant="outline" onClick={markAllRead}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 max-w-md">
        <StatCard icon={Mail} label="Unread" value={unread} iconTone="gold" />
        <StatCard icon={Inbox} label="Total" value={scoped.length} iconTone="navy" />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mt-4">
        <TabsList className="bg-[--bg-surface] border border-[--border-default]">
          <TabsTrigger value="all">All ({scoped.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread})</TabsTrigger>
          <TabsTrigger value="read">Read ({scoped.length - unread})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {filtered.length === 0 ? (
            <Card className="mt-4">
              <EmptyState icon={Inbox} title="No messages" description="Your inbox is empty for this filter." />
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-4">
              <Card className="lg:col-span-2 overflow-hidden">
                <ul className="divide-y divide-[--border-default] max-h-[calc(100vh-280px)] overflow-y-auto">
                  {filtered.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(m.id)}
                        className={`w-full text-left px-4 py-3.5 hover:bg-[--bg-base]/60 transition-colors ${
                          selected?.id === m.id ? "bg-[--bg-base] border-l-2 border-l-[--accent-primary]" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {m.read ? (
                            <MailOpen className="h-4 w-4 text-[--text-muted] shrink-0 mt-0.5" />
                          ) : (
                            <Mail className="h-4 w-4 text-[--accent-primary] shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm truncate ${!m.read ? "font-semibold" : "font-medium"}`}>
                              {m.subject}
                            </div>
                            <div className="text-xs text-[--text-muted] mt-0.5 truncate">
                              {pastorName(m.fromId)} · {formatRelative(m.at)}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="lg:col-span-3">
                {selected ? (
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-display text-xl font-semibold">{selected.subject}</h2>
                        <p className="text-sm text-[--text-muted] mt-1">
                          From <span className="font-medium text-[--text-primary]">{pastorName(selected.fromId)}</span>
                          {" · "}
                          <span className="font-mono text-xs">{formatRelative(selected.at)}</span>
                        </p>
                      </div>
                      {!selected.read && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[--accent-primary]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[--accent-primary]">
                          <Star className="h-3 w-3" /> New
                        </span>
                      )}
                    </div>
                    <div className="mt-6 rounded-lg bg-[--bg-base] p-5 text-sm leading-relaxed text-[--text-primary]">
                      {selected.body}
                    </div>
                    <div className="mt-6 flex gap-2">
                      <Button size="sm" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
                        Reply
                      </Button>
                      <Button size="sm" variant="outline">Archive</Button>
                    </div>
                  </div>
                ) : (
                  <EmptyState icon={Mail} title="Select a message" description="Choose a message from the list to read." />
                )}
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
