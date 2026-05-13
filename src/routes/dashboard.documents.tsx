import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, FileText, Search, Download, Eye, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui-kit/badges";
import { documents, pastorName } from "@/lib/data/seed";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/documents")({ component: DocsPage });

const categoryTone: Record<string, "gold" | "info" | "indigo" | "success" | "neutral"> = {
  Policy: "gold", Constitution: "indigo", Circular: "info", Form: "success", Certificate: "neutral",
};

function DocsPage() {
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("");
  const filtered = documents.filter(d => {
    if (q && !d.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat && d.category !== cat) return false;
    return true;
  });

  return (
    <>
      <PageHeader title="Document Library" description="Policies, circulars, forms, and certificates."
        actions={<Button className="bg-[--accent-primary] hover:bg-[--accent-hover] text-white" size="sm"><Plus className="h-4 w-4 mr-1.5" /> Upload Document</Button>}
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-[--border-default]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-muted]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents..." className="w-full rounded-md border border-[--border-default] pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--accent-primary]/30" />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-md border border-[--border-default] px-3 py-2 text-sm">
            <option value="">All categories</option>
            {Object.keys(categoryTone).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
          {filtered.map(d => (
            <div key={d.id} className="rounded-lg border border-[--border-default] p-4 hover:border-[--accent-primary]/40 hover:shadow-sm transition">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[--accent-primary]/10 text-[--accent-primary]"><FileText className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 justify-between">
                    <p className="font-medium text-sm leading-snug truncate">{d.name}</p>
                  </div>
                  <Badge tone={categoryTone[d.category]} className="mt-1.5">{d.category}</Badge>
                </div>
              </div>
              <p className="text-xs text-[--text-muted] mt-3 line-clamp-2">{d.description}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-[--text-muted] font-mono">
                <span>{formatDate(d.uploadedAt)}</span>
                <span>{d.sizeKb} KB</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs"><Eye className="h-3.5 w-3.5 mr-1" /> Preview</Button>
                <Button size="sm" className="flex-1 h-8 text-xs bg-[--accent-primary] hover:bg-[--accent-hover] text-white"><Download className="h-3.5 w-3.5 mr-1" /> Download</Button>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="py-12 text-center text-sm text-[--text-muted]">No documents match your filters.</div>}
      </Card>
    </>
  );
}
