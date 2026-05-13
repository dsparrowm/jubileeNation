import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Calendar, ArrowLeft, ArrowLeftRight, Pencil, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, RankBadge } from "@/components/ui-kit/badges";
import { findPastor, branchName, stateName, transfers, leaveRequests, branches, auditFeed } from "@/lib/data/seed";
import { formatDate, formatRelative, initials, daysBetween } from "@/lib/format";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/dashboard/pastors/$id")({
  component: PastorProfilePage,
});

function PastorProfilePage() {
  const { id } = Route.useParams();
  const p = findPastor(id);
  if (!p) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-[--text-muted]">Pastor not found.</p>
        <Link to="/dashboard/pastors" className="text-[--accent-primary] text-sm font-medium mt-2 inline-block">Back to directory</Link>
      </div>
    );
  }

  const pastorTransfers = transfers.filter(t => t.pastorId === p.id);
  const pastorLeave = leaveRequests.filter(l => l.pastorId === p.id);

  return (
    <>
      <Link to="/dashboard/pastors" className="inline-flex items-center gap-1 text-sm text-[--text-muted] hover:text-[--text-primary] mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <Card className="lg:col-span-1 h-fit">
          <CardBody className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-2xl font-semibold">
              {initials(p.firstName, p.lastName)}
            </div>
            <h1 className="mt-4 text-xl font-bold">{p.firstName} {p.lastName}</h1>
            <div className="mt-2 flex items-center justify-center gap-2">
              <RankBadge rank={p.rank} />
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-5 space-y-2 text-left text-sm">
              <Row icon={Phone} label={p.phone} mono />
              <Row icon={Mail} label={p.email} />
              <Row icon={MapPin} label={branchName(p.branchId) === "—" ? `${stateName(p.stateId)} State Office` : `${branchName(p.branchId)}, ${stateName(p.stateId)}`} />
              <Row icon={Calendar} label={`Ordained ${formatDate(p.ordainedAt)}`} mono />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]" size="sm">
                <ArrowLeftRight className="h-3.5 w-3.5 mr-1" /> Transfer
              </Button>
              <Button variant="outline" size="sm">
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Right column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="bg-[--bg-surface] border border-[--border-default]">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="leave">Leave History</TabsTrigger>
              <TabsTrigger value="docs">Documents</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader><div><CardTitle>Personal Information</CardTitle></div></CardHeader>
                <CardBody className="grid grid-cols-2 gap-4 text-sm">
                  <Field label="First Name" value={p.firstName} />
                  <Field label="Last Name" value={p.lastName} />
                  <Field label="Email" value={p.email} />
                  <Field label="Phone" value={p.phone} mono />
                  <Field label="Pastoral Rank" value={p.rank} />
                  <Field label="Status" value={<StatusBadge status={p.status} />} />
                  <Field label="Date Ordained" value={formatDate(p.ordainedAt)} mono />
                  <Field label="Branch" value={branchName(p.branchId)} />
                  <Field label="Qualifications" value={p.qualifications} />
                  <Field label="Emergency Contact" value={p.emergencyContact} mono />
                </CardBody>
              </Card>
            </TabsContent>

            <TabsContent value="assignments">
              <Card>
                <CardHeader><div><CardTitle>Assignment History</CardTitle></div></CardHeader>
                <ul className="px-5 py-2 space-y-3">
                  {(pastorTransfers.length > 0 ? pastorTransfers : [
                    { id: "current", fromBranchId: branches[0].id, toBranchId: p.branchId ?? branches[0].id, effectiveDate: p.ordainedAt, status: "Approved" as const, reason: "Initial assignment" }
                  ]).map((t, i) => (
                    <li key={t.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-[--accent-primary]" />
                        {i < pastorTransfers.length - 1 && <div className="w-px flex-1 bg-[--border-default] my-1" />}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{branchName(t.toBranchId)}</div>
                          <span className="text-xs text-[--text-muted] font-mono">{formatDate(t.effectiveDate)}</span>
                        </div>
                        <div className="text-xs text-[--text-muted] mt-0.5">From {branchName(t.fromBranchId)} · {t.reason}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="leave">
              <Card>
                <CardHeader><div><CardTitle>Leave History</CardTitle></div></CardHeader>
                {pastorLeave.length === 0 ? (
                  <CardBody><p className="text-sm text-[--text-muted]">No leave records.</p></CardBody>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
                      <tr>
                        <th className="text-left px-5 py-2 font-medium">Type</th>
                        <th className="text-left px-3 py-2 font-medium">From</th>
                        <th className="text-left px-3 py-2 font-medium">To</th>
                        <th className="text-right px-3 py-2 font-medium">Days</th>
                        <th className="text-left px-5 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[--border-default]">
                      {pastorLeave.map(l => (
                        <tr key={l.id}>
                          <td className="px-5 py-2.5">{l.type}</td>
                          <td className="px-3 py-2.5 font-mono text-xs">{formatDate(l.fromDate)}</td>
                          <td className="px-3 py-2.5 font-mono text-xs">{formatDate(l.toDate)}</td>
                          <td className="px-3 py-2.5 text-right font-mono">{daysBetween(l.fromDate, l.toDate)}</td>
                          <td className="px-5 py-2.5"><StatusBadge status={l.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="docs">
              <Card>
                <CardHeader><div><CardTitle>Documents & Credentials</CardTitle></div></CardHeader>
                <CardBody>
                  <ul className="space-y-2">
                    {["Ordination Certificate", "Theological Degree", "Background Check"].map((d, i) => (
                      <li key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-[--border-default]">
                        <FileText className="h-4 w-4 text-[--accent-primary]" />
                        <span className="text-sm flex-1">{d}</span>
                        <span className="text-xs text-[--text-muted] font-mono">PDF</span>
                        <Button size="sm" variant="outline" className="h-7 text-xs">Download</Button>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader><div><CardTitle>Activity</CardTitle></div></CardHeader>
                <ul className="divide-y divide-[--border-default]">
                  {auditFeed.slice(0, 6).map(ev => (
                    <li key={ev.id} className="px-5 py-3 text-sm">
                      <div>{ev.description}</div>
                      <div className="text-xs text-[--text-muted] mt-0.5 font-mono">{formatRelative(ev.at)}</div>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function Row({ icon: Icon, label, mono }: { icon: any; label: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-[--text-muted]">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className={`truncate ${mono ? "font-mono text-xs" : ""}`}>{label}</span>
    </div>
  );
}
function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-[--text-muted]">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono text-sm" : "text-sm"}`}>{value}</div>
    </div>
  );
}
