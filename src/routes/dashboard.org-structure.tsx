import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Network, Plus, ChevronDown, ChevronRight, Building2, MapPin, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { states, branches, districts, pastorName } from "@/lib/data/seed";

export const Route = createFileRoute("/dashboard/org-structure")({
  component: OrgStructurePage,
});

function OrgStructurePage() {
  const [view, setView] = React.useState<"tree" | "table">("tree");
  const [openStates, setOpenStates] = React.useState<Set<string>>(new Set([states[0].id]));

  const toggle = (id: string) => {
    const next = new Set(openStates);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenStates(next);
  };

  return (
    <>
      <PageHeader
        title="Organisation Structure"
        description="Hierarchy of HQ, States, Districts, and Branches across JNIC."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add State
            </Button>
            <Button className="bg-[--accent-primary] hover:bg-[--accent-hover] text-white" size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add Branch
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-1 mb-4 bg-[--bg-surface] border border-[--border-default] rounded-md p-1 w-fit">
        {(["tree", "table"] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1.5 text-xs font-medium rounded ${view === v ? "bg-[--bg-base] text-[--text-primary]" : "text-[--text-muted] hover:text-[--text-primary]"}`}
          >
            {v === "tree" ? "Tree View" : "Table View"}
          </button>
        ))}
      </div>

      {view === "tree" ? (
        <Card>
          <div className="p-6 overflow-x-auto">
            {/* HQ root */}
            <div className="flex items-start gap-6 min-w-fit">
              <div className="rounded-lg border-2 border-[--accent-primary] bg-[--accent-primary]/5 px-4 py-3 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-[--accent-primary]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[--accent-primary]">HQ</span>
                </div>
                <div className="mt-1 font-semibold text-sm">Jubilee Nation Int'l Churches</div>
                <div className="text-xs text-[--text-muted] font-mono mt-0.5">{branches.length} branches · {states.length} states</div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {states.map(s => {
                  const open = openStates.has(s.id);
                  const stBranches = branches.filter(b => b.stateId === s.id);
                  return (
                    <div key={s.id}>
                      <button
                        onClick={() => toggle(s.id)}
                        className="flex items-center gap-2 rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-2 hover:border-[--accent-primary]/50 min-w-[260px]"
                      >
                        {open ? <ChevronDown className="h-3.5 w-3.5 text-[--text-muted]" /> : <ChevronRight className="h-3.5 w-3.5 text-[--text-muted]" />}
                        <MapPin className="h-3.5 w-3.5 text-[--bg-sidebar]" />
                        <span className="text-sm font-medium">{s.name} State</span>
                        <span className="ml-auto text-[11px] font-mono text-[--text-muted]">{stBranches.length} branches</span>
                      </button>
                      {open && (
                        <div className="mt-2 ml-8 grid gap-1.5">
                          {stBranches.map(b => (
                            <div key={b.id} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded border border-[--border-default] bg-[--bg-base]/40">
                              <Building2 className="h-3 w-3 text-[--text-muted]" />
                              <span className="font-medium">{b.name}</span>
                              <span className="ml-auto text-[--text-muted]">{pastorName(b.seniorPastorId)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[--text-muted] bg-[--bg-base]">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Node</th>
                  <th className="text-left px-3 py-3 font-medium">Type</th>
                  <th className="text-left px-3 py-3 font-medium">Parent</th>
                  <th className="text-left px-3 py-3 font-medium">Assigned Pastor</th>
                  <th className="text-left px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border-default]">
                {states.map(s => (
                  <tr key={s.id} className="hover:bg-[--bg-base]/40">
                    <td className="px-5 py-3 font-medium">{s.name} State</td>
                    <td className="px-3 py-3"><span className="text-xs text-[--text-muted]">State</span></td>
                    <td className="px-3 py-3 text-xs text-[--text-muted]">HQ</td>
                    <td className="px-3 py-3">{pastorName(s.pastorId)}</td>
                    <td className="px-3 py-3"><StatusBadge status="Active" /></td>
                  </tr>
                ))}
                {branches.map(b => (
                  <tr key={b.id} className="hover:bg-[--bg-base]/40">
                    <td className="px-5 py-3">{b.name}</td>
                    <td className="px-3 py-3"><span className="text-xs text-[--text-muted]">Branch</span></td>
                    <td className="px-3 py-3 text-xs text-[--text-muted]">{states.find(s => s.id === b.stateId)?.name}</td>
                    <td className="px-3 py-3">{pastorName(b.seniorPastorId)}</td>
                    <td className="px-3 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
