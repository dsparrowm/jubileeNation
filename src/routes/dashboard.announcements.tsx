import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { useRole, ROLE_LABELS } from "@/lib/role-context";
import { useMockStore } from "@/lib/data/mock-store";
import { pastorName } from "@/lib/data/seed";
import { filterAnnouncements } from "@/lib/data/filters";
import { formatDate, formatRelative } from "@/lib/format";

export const Route = createFileRoute("/dashboard/announcements")({ component: AnnouncementsPage });

function AnnouncementsPage() {
  const { role, user } = useRole();
  const { announcements, publishAnnouncement } = useMockStore();
  const [showModal, setShowModal] = React.useState(false);
  const scoped = filterAnnouncements({ role, user }, announcements).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );

  const canPublish = role === "STATE_PASTOR";

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Official updates from HQ, your state office, and your branch."
        actions={
          canPublish ? (
            <Button
              className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
              size="sm"
              onClick={() => setShowModal(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> New Announcement
            </Button>
          ) : undefined
        }
      />
      <div className="space-y-3">
        {scoped.map((a) => (
          <Card key={a.id}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold">{a.title}</h2>
                    {a.priority === "Urgent" && <StatusBadge status="Urgent" />}
                    <ScopeBadge scope={a.scope} />
                  </div>
                  <p className="text-sm text-[--text-muted] mt-2 leading-relaxed">{a.body}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-[--text-muted]">
                    <span>
                      From {pastorName(a.senderId)} · {ROLE_LABELS[a.senderRole]}
                    </span>
                    <span>·</span>
                    <span title={formatDate(a.publishedAt.slice(0, 10))}>
                      {formatRelative(a.publishedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {scoped.length === 0 && (
          <Card>
            <EmptyState
              icon={Megaphone}
              title="No announcements"
              description="There are no announcements in your scope right now."
            />
          </Card>
        )}
      </div>

      {showModal && user.stateId && (
        <PublishAnnouncementModal
          onClose={() => setShowModal(false)}
          onSubmit={(input) => {
            publishAnnouncement({
              ...input,
              scopeId: user.stateId!,
              senderId: user.id,
              senderRole: role,
            });
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}

function PublishAnnouncementModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    body: string;
    priority: "Normal" | "Urgent";
  }) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [priority, setPriority] = React.useState<"Normal" | "Urgent">("Normal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSubmit({ title: title.trim(), body: body.trim(), priority });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--border-default]">
          <h2 className="text-base font-semibold">New State Announcement</h2>
          <button type="button" onClick={onClose} className="text-[--text-muted] hover:text-[--text-primary]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-[--text-muted]">
            This announcement will be visible to all pastors and staff in your state.
          </p>
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[--text-muted]">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as "Normal" | "Urgent")}
              className="mt-1 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]">
              Publish
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function ScopeBadge({ scope }: { scope: "All" | "State" | "Branch" }) {
  const labels = { All: "Organisation-wide", State: "State", Branch: "Branch" };
  return (
    <span className="inline-flex items-center rounded-full bg-[--bg-base] border border-[--border-default] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[--text-muted]">
      {labels[scope]}
    </span>
  );
}
