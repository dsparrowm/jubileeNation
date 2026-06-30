import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Network, Plus, ChevronDown, ChevronRight, Building2, MapPin, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-kit/badges";
import { BranchDrawer } from "@/components/org/branch-drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { pastors, pastorName } from "@/lib/data/seed";
import { useMockStore } from "@/lib/data/mock-store";
import type { Branch } from "@/lib/data/types";

export const Route = createFileRoute("/dashboard/org-structure")({
  component: OrgStructurePage,
});

function matchesSearch(
  query: string,
  stateName: string,
  statePastorId: string,
  branch?: Branch,
): boolean {
  const q = query.toLowerCase();
  if (stateName.toLowerCase().includes(q)) return true;
  if (pastorName(statePastorId).toLowerCase().includes(q)) return true;
  if (branch) {
    if (branch.name.toLowerCase().includes(q)) return true;
    if (pastorName(branch.seniorPastorId).toLowerCase().includes(q)) return true;
  }
  return false;
}

function OrgStructurePage() {
  const { branches, states, addBranch, addState } = useMockStore();

  const [openStates, setOpenStates] = React.useState<Set<string>>(new Set([states[0]?.id]));
  const [search, setSearch] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState("");
  const [selectedBranchId, setSelectedBranchId] = React.useState<string | null>(null);
  const [addStateOpen, setAddStateOpen] = React.useState(false);
  const [addBranchOpen, setAddBranchOpen] = React.useState(false);

  const [newStateName, setNewStateName] = React.useState("");
  const [newStatePastorId, setNewStatePastorId] = React.useState("");
  const [newBranchName, setNewBranchName] = React.useState("");
  const [newBranchStateId, setNewBranchStateId] = React.useState(states[0]?.id ?? "");
  const [newBranchPastorId, setNewBranchPastorId] = React.useState("");

  const statePastorOptions = pastors.filter((p) => p.rank === "State Pastor" || p.rank === "Zonal Pastor");
  const seniorPastorOptions = pastors.filter(
    (p) => p.rank === "Senior Pastor" || p.rank === "Pastor" || p.rank === "Zonal Pastor",
  );

  const filteredStates = React.useMemo(() => {
    return states.filter((s) => {
      if (stateFilter && s.id !== stateFilter) return false;
      if (!search) return true;

      const stBranches = branches.filter((b) => b.stateId === s.id);
      if (matchesSearch(search, s.name, s.pastorId)) return true;
      return stBranches.some((b) => matchesSearch(search, s.name, s.pastorId, b));
    });
  }, [states, branches, stateFilter, search]);

  const autoExpandedStates = React.useMemo(() => {
    if (!search) return openStates;
    const next = new Set(openStates);
    for (const s of filteredStates) {
      const stBranches = branches.filter((b) => b.stateId === s.id);
      const stateMatches = matchesSearch(search, s.name, s.pastorId);
      const branchMatches = stBranches.some((b) => matchesSearch(search, s.name, s.pastorId, b));
      if (stateMatches || branchMatches) next.add(s.id);
    }
    return next;
  }, [search, filteredStates, branches, openStates]);

  React.useEffect(() => {
    if (states.length > 0 && openStates.size === 0) {
      setOpenStates(new Set([states[0].id]));
    }
  }, [states, openStates.size]);

  const toggle = (id: string) => {
    const next = new Set(openStates);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenStates(next);
  };

  const expandAll = () => setOpenStates(new Set(filteredStates.map((s) => s.id)));
  const collapseAll = () => setOpenStates(new Set());

  const selectedBranch = selectedBranchId
    ? branches.find((b) => b.id === selectedBranchId) ?? null
    : null;

  const handleAddState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName.trim() || !newStatePastorId) return;
    addState({ name: newStateName.trim(), pastorId: newStatePastorId });
    setNewStateName("");
    setNewStatePastorId("");
    setAddStateOpen(false);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchStateId || !newBranchPastorId) return;
    addBranch({
      name: newBranchName.trim(),
      stateId: newBranchStateId,
      districtId: `${newBranchStateId}-d1`,
      address: "Address pending",
      foundedYear: new Date().getFullYear(),
      seniorPastorId: newBranchPastorId,
      phone: "+234 800 000 0000",
      status: "Active",
    });
    setOpenStates((prev) => new Set([...prev, newBranchStateId]));
    setNewBranchName("");
    setNewBranchPastorId("");
    setAddBranchOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Organisation Structure"
        description="National hierarchy — manage states and branches across JNIC."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddStateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add State
            </Button>
            <Button
              className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
              size="sm"
              onClick={() => setAddBranchOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Branch
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-muted]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search states, branches, or pastors..."
              className="w-full rounded-md border border-[--border-default] bg-[--bg-surface] pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--accent-primary]/30 focus:border-[--accent-primary]"
            />
          </div>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-2 text-sm"
          >
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand all
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse all
            </Button>
          </div>
        </div>
        <p className="text-xs text-[--text-muted]">
          For report status, attendance, and contact details,{" "}
          <Link to="/dashboard/branches" className="text-[--accent-primary] hover:text-[--accent-hover] font-medium">
            open Branch Directory
          </Link>
          .
        </p>
      </div>

      <Card>
        <div className="p-6 overflow-x-auto">
            <div className="flex items-start gap-6 min-w-fit">
              <div className="rounded-lg border-2 border-[--accent-primary] bg-[--accent-primary]/5 px-4 py-3 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-[--accent-primary]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[--accent-primary]">
                    HQ
                  </span>
                </div>
                <div className="mt-1 font-semibold text-sm">Jubilee Nation Int&apos;l Churches</div>
                <div className="text-xs text-[--text-muted] font-mono mt-0.5">
                  {branches.length} branches · {states.length} states
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {filteredStates.length === 0 && (
                  <p className="text-sm text-[--text-muted] py-4">No states match your search.</p>
                )}
                {filteredStates.map((s) => {
                  const open = autoExpandedStates.has(s.id);
                  const stBranches = branches.filter((b) => {
                    if (b.stateId !== s.id) return false;
                    if (!search) return true;
                    return (
                      matchesSearch(search, s.name, s.pastorId) ||
                      matchesSearch(search, s.name, s.pastorId, b)
                    );
                  });
                  return (
                    <div key={s.id}>
                      <div className="flex items-center gap-2 rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-2 hover:border-[--accent-primary]/50 min-w-[320px]">
                        <button
                          type="button"
                          onClick={() => toggle(s.id)}
                          className="flex items-center gap-2 flex-1 min-w-0 text-left"
                        >
                          {open ? (
                            <ChevronDown className="h-3.5 w-3.5 text-[--text-muted] shrink-0" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-[--text-muted] shrink-0" />
                          )}
                          <MapPin className="h-3.5 w-3.5 text-[--bg-sidebar] shrink-0" />
                          <span className="text-sm font-medium truncate">{s.name} State</span>
                        </button>
                        <span className="text-[11px] text-[--text-muted] truncate max-w-[100px] hidden sm:inline">
                          {pastorName(s.pastorId)}
                        </span>
                        <span className="text-[11px] font-mono text-[--text-muted] shrink-0">
                          {stBranches.length} branches
                        </span>
                      </div>
                      {open && (
                        <div className="mt-2 ml-8 grid gap-1.5">
                          {stBranches.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setSelectedBranchId(b.id)}
                              className="flex items-center gap-2 text-xs px-3 py-1.5 rounded border border-[--border-default] bg-[--bg-base]/40 hover:border-[--accent-primary]/50 hover:bg-[--bg-base]/70 cursor-pointer text-left w-full min-w-[280px]"
                            >
                              <Building2 className="h-3 w-3 text-[--text-muted] shrink-0" />
                              <span className="font-medium truncate">{b.name}</span>
                              <span className="ml-auto text-[--text-muted] truncate max-w-[90px] hidden sm:inline">
                                {pastorName(b.seniorPastorId)}
                              </span>
                              <StatusBadge status={b.status} />
                            </button>
                          ))}
                          {stBranches.length === 0 && (
                            <p className="text-xs text-[--text-muted] px-3 py-1">No branches in this state.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

      {selectedBranch && (
        <BranchDrawer
          branch={selectedBranch}
          onClose={() => setSelectedBranchId(null)}
          showBranchDirectoryLink
        />
      )}

      <Dialog open={addStateOpen} onOpenChange={setAddStateOpen}>
        <DialogContent>
          <form onSubmit={handleAddState}>
            <DialogHeader>
              <DialogTitle>Add State</DialogTitle>
              <DialogDescription>Create a new state in the organisation hierarchy.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">State name</label>
                <input
                  value={newStateName}
                  onChange={(e) => setNewStateName(e.target.value)}
                  placeholder="e.g. Ogun"
                  className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">State pastor</label>
                <select
                  value={newStatePastorId}
                  onChange={(e) => setNewStatePastorId(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select pastor</option>
                  {statePastorOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.rank})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddStateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
              >
                Add State
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={addBranchOpen} onOpenChange={setAddBranchOpen}>
        <DialogContent>
          <form onSubmit={handleAddBranch}>
            <DialogHeader>
              <DialogTitle>Add Branch</DialogTitle>
              <DialogDescription>Add a new branch under an existing state.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Branch name</label>
                <input
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g. Abeokuta Central"
                  className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <select
                  value={newBranchStateId}
                  onChange={(e) => setNewBranchStateId(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
                  required
                >
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Senior pastor</label>
                <select
                  value={newBranchPastorId}
                  onChange={(e) => setNewBranchPastorId(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-[--border-default] px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select pastor</option>
                  {seniorPastorOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.rank})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddBranchOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="!bg-[var(--accent-primary)] !text-white hover:!bg-[var(--accent-hover)]"
              >
                Add Branch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
