import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Users, Building2, UserCog, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui-kit/card";
import { Input } from "@/components/ui/input";
import { RankBadge } from "@/components/ui-kit/badges";
import { EmptyState } from "@/components/ui-kit/empty-state";
import { useRole } from "@/lib/role-context";
import { filterPastors, filterBranches } from "@/lib/data/filters";
import { pastors, branches, staffMembers, states, stateName, branchName } from "@/lib/data/seed";
import { initials } from "@/lib/format";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/dashboard/search")({ component: SearchPage });

type SearchTab = "all" | "pastors" | "branches" | "staff";

function SearchPage() {
  const { role, user } = useRole();
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<SearchTab>("all");
  const [stateFilter, setStateFilter] = React.useState<string>("all");
  const [rankFilter, setRankFilter] = React.useState<string>("all");

  const scopedPastors = filterPastors({ role, user }, pastors);
  const scopedBranches = filterBranches({ role, user }, branches);
  const scopedStaff = staffMembers.filter((s) => {
    if (role === "STATE_PASTOR") return s.stateId === user.stateId;
    if (role === "BRANCH_PASTOR" || role === "STAFF") return s.branchId === user.branchId;
    return true;
  });

  const q = query.toLowerCase().trim();

  const matchPastor = (p: (typeof pastors)[0]) => {
    if (stateFilter !== "all" && p.stateId !== stateFilter) return false;
    if (rankFilter !== "all" && p.rank !== rankFilter) return false;
    if (!q) return true;
    return (
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.rank.toLowerCase().includes(q)
    );
  };

  const matchBranch = (b: (typeof branches)[0]) => {
    if (stateFilter !== "all" && b.stateId !== stateFilter) return false;
    if (!q) return true;
    return b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q);
  };

  const matchStaff = (s: (typeof staffMembers)[0]) => {
    if (stateFilter !== "all" && s.stateId !== stateFilter) return false;
    if (!q) return true;
    return s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q);
  };

  const pastorResults = scopedPastors.filter(matchPastor);
  const branchResults = scopedBranches.filter(matchBranch);
  const staffResults = scopedStaff.filter(matchStaff);

  const totalResults =
    (tab === "all" || tab === "pastors" ? pastorResults.length : 0) +
    (tab === "all" || tab === "branches" ? branchResults.length : 0) +
    (tab === "all" || tab === "staff" ? staffResults.length : 0);

  const ranks = [...new Set(pastors.map((p) => p.rank))];

  return (
    <>
      <PageHeader
        title="People Search"
        description="Find pastors, branches, and staff across the organisation."
      />

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[--text-muted]" />
          <Input
            placeholder="Search by name, email, branch, or role…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-primary]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-1.5 text-xs"
          >
            <option value="all">All States</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="rounded-md border border-[--border-default] bg-[--bg-surface] px-3 py-1.5 text-xs"
          >
            <option value="all">All Ranks</option>
            {ranks.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as SearchTab)} className="mt-4">
        <TabsList className="bg-[--bg-surface] border border-[--border-default]">
          <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
          <TabsTrigger value="pastors"><Users className="h-3.5 w-3.5 mr-1" /> Pastors ({pastorResults.length})</TabsTrigger>
          <TabsTrigger value="branches"><Building2 className="h-3.5 w-3.5 mr-1" /> Branches ({branchResults.length})</TabsTrigger>
          <TabsTrigger value="staff"><UserCog className="h-3.5 w-3.5 mr-1" /> Staff ({staffResults.length})</TabsTrigger>
        </TabsList>

        {totalResults === 0 ? (
          <Card className="mt-4">
            <EmptyState icon={Search} title="No results" description="Try a different search term or filter." />
          </Card>
        ) : (
          <>
            {(tab === "all" || tab === "pastors") && pastorResults.length > 0 && (
              <TabsContent value={tab}>
                <Card className="mt-4">
                  <div className="px-5 py-3 border-b border-[--border-default] text-sm font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-[--accent-primary]" /> Pastors ({pastorResults.length})
                  </div>
                  <ul className="divide-y divide-[--border-default]">
                    {pastorResults.slice(0, tab === "pastors" ? 50 : 8).map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/dashboard/pastors/$id"
                          params={{ id: p.id }}
                          className="flex items-center gap-3 px-5 py-3.5 hover:bg-[--bg-base]/50"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-sm font-semibold">
                            {initials(p.firstName, p.lastName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{p.firstName} {p.lastName}</div>
                            <div className="text-xs text-[--text-muted]">{p.email}</div>
                          </div>
                          <RankBadge rank={p.rank} />
                          <div className="text-xs text-[--text-muted] text-right hidden sm:block">
                            {branchName(p.branchId) || stateName(p.stateId)}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>
            )}

            {(tab === "all" || tab === "branches") && branchResults.length > 0 && (
              <TabsContent value={tab}>
                <Card className="mt-4">
                  <div className="px-5 py-3 border-b border-[--border-default] text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[--accent-primary]" /> Branches ({branchResults.length})
                  </div>
                  <ul className="divide-y divide-[--border-default]">
                    {branchResults.slice(0, tab === "branches" ? 50 : 6).map((b) => (
                      <li key={b.id}>
                        <Link
                          to="/dashboard/branches"
                          className="flex items-center gap-3 px-5 py-3.5 hover:bg-[--bg-base]/50"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[--bg-base] text-[--accent-primary]">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{b.name}</div>
                            <div className="text-xs text-[--text-muted]">{stateName(b.stateId)} · Founded {b.foundedYear}</div>
                          </div>
                          <span className="text-xs text-[--text-muted]">{b.status}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>
            )}

            {(tab === "all" || tab === "staff") && staffResults.length > 0 && (
              <TabsContent value={tab}>
                <Card className="mt-4">
                  <div className="px-5 py-3 border-b border-[--border-default] text-sm font-semibold flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-[--accent-primary]" /> Staff ({staffResults.length})
                  </div>
                  <ul className="divide-y divide-[--border-default]">
                    {staffResults.map((s) => (
                      <li key={s.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[--bg-base]/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--bg-base] text-[--text-muted] text-sm font-semibold">
                          {initials(s.name.split(" ")[0], s.name.split(" ")[1] ?? "")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-[--text-muted]">{s.role}</div>
                        </div>
                        <div className="text-xs text-[--text-muted] text-right">
                          {branchName(s.branchId)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>
            )}
          </>
        )}
      </Tabs>
    </>
  );
}
