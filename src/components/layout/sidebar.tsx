import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCog,
  ArrowLeftRight,
  CalendarOff,
  CalendarRange,
  FileBarChart,
  Wallet,
  Megaphone,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
  Network,
  ClipboardList,
  CheckSquare,
  Calendar,
  ShieldCheck,
  ScrollText,
  Search,
  TrendingUp,
  Inbox,
  Music,
  FileSpreadsheet,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole, ROLE_LABELS } from "@/lib/role-context";
import { useMockStore } from "@/lib/data/mock-store";
import type { Role } from "@/lib/data/types";
import { initials } from "@/lib/format";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function buildNav(role: Role, pendingCount: number): NavGroup[] {
  const approvalBadge = pendingCount > 0 ? pendingCount : undefined;

  const maps: Record<Role, NavGroup[]> = {
    HQ_ADMIN: [
      { label: "", items: [{ label: "Overview", to: "/dashboard", icon: LayoutDashboard }] },
      {
        label: "Organisation",
        items: [
          { label: "Org Structure", to: "/dashboard/org-structure", icon: Network },
          { label: "Branch Directory", to: "/dashboard/branches", icon: Building2 },
        ],
      },
      {
        label: "People",
        items: [
          { label: "Pastor Directory", to: "/dashboard/pastors", icon: Users },
          { label: "Staff Directory", to: "/dashboard/staff", icon: UserCog },
          { label: "People Search", to: "/dashboard/search", icon: Search },
        ],
      },
      {
        label: "Operations",
        items: [
          { label: "Approval Center", to: "/dashboard/approvals", icon: ClipboardCheck, badge: approvalBadge },
          { label: "Transfers", to: "/dashboard/transfers", icon: ArrowLeftRight },
          { label: "Leave", to: "/dashboard/leave", icon: CalendarOff },
          { label: "Events", to: "/dashboard/events", icon: CalendarRange },
          { label: "Tasks", to: "/dashboard/tasks", icon: CheckSquare },
          { label: "Calendar", to: "/dashboard/calendar", icon: Calendar },
        ],
      },
      {
        label: "Reporting",
        items: [
          { label: "Branch Reports", to: "/dashboard/reports", icon: FileBarChart },
          { label: "Reports Builder", to: "/dashboard/reports/builder", icon: FileSpreadsheet },
          { label: "Finance", to: "/dashboard/finance", icon: Wallet },
          { label: "Payroll Wallet", to: "/dashboard/wallet", icon: Wallet },
          { label: "Compliance", to: "/dashboard/compliance", icon: ShieldCheck },
        ],
      },
      {
        label: "Communication",
        items: [
          { label: "Inbox", to: "/dashboard/inbox", icon: Inbox },
          { label: "Announcements", to: "/dashboard/announcements", icon: Megaphone },
          { label: "Documents", to: "/dashboard/documents", icon: FolderOpen },
        ],
      },
      {
        label: "Insights",
        items: [
          { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
          { label: "Ministry Impact", to: "/dashboard/impact", icon: TrendingUp },
          { label: "Audit Log", to: "/dashboard/audit", icon: ScrollText },
          { label: "My Wallet", to: "/dashboard/wallet/my", icon: Wallet },
          { label: "Settings", to: "/dashboard/settings", icon: Settings },
        ],
      },
    ],
    GENERAL_OVERSEER: [
      { label: "", items: [{ label: "Overview", to: "/dashboard", icon: LayoutDashboard }] },
      {
        label: "Organisation",
        items: [
          { label: "Org Structure", to: "/dashboard/org-structure", icon: Network },
          { label: "Branch Directory", to: "/dashboard/branches", icon: Building2 },
        ],
      },
      {
        label: "People",
        items: [
          { label: "Pastor Directory", to: "/dashboard/pastors", icon: Users },
          { label: "People Search", to: "/dashboard/search", icon: Search },
        ],
      },
      {
        label: "Operations",
        items: [
          { label: "Approval Center", to: "/dashboard/approvals", icon: ClipboardCheck, badge: approvalBadge },
          { label: "Transfers", to: "/dashboard/transfers", icon: ArrowLeftRight },
          { label: "Leave", to: "/dashboard/leave", icon: CalendarOff },
          { label: "Events", to: "/dashboard/events", icon: CalendarRange },
          { label: "Calendar", to: "/dashboard/calendar", icon: Calendar },
        ],
      },
      {
        label: "Reporting",
        items: [
          { label: "Branch Reports", to: "/dashboard/reports", icon: FileBarChart },
          { label: "Finance", to: "/dashboard/finance", icon: Wallet },
          { label: "Compliance", to: "/dashboard/compliance", icon: ShieldCheck },
        ],
      },
      {
        label: "Communication",
        items: [
          { label: "Inbox", to: "/dashboard/inbox", icon: Inbox },
          { label: "Announcements", to: "/dashboard/announcements", icon: Megaphone },
          { label: "Documents", to: "/dashboard/documents", icon: FolderOpen },
        ],
      },
      {
        label: "Insights",
        items: [
          { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
          { label: "Ministry Impact", to: "/dashboard/impact", icon: TrendingUp },
          { label: "Audit Log", to: "/dashboard/audit", icon: ScrollText },
        ],
      },
    ],
    STATE_PASTOR: [
      { label: "", items: [{ label: "Overview", to: "/dashboard", icon: LayoutDashboard }] },
      {
        label: "My State",
        items: [
          { label: "State Branches", to: "/dashboard/branches", icon: Building2 },
          { label: "Pastors", to: "/dashboard/pastors", icon: Users },
          { label: "Staff", to: "/dashboard/staff", icon: UserCog },
          { label: "People Search", to: "/dashboard/search", icon: Search },
        ],
      },
      {
        label: "Operations",
        items: [
          { label: "Approval Center", to: "/dashboard/approvals", icon: ClipboardCheck, badge: approvalBadge },
          { label: "Transfers", to: "/dashboard/transfers", icon: ArrowLeftRight },
          { label: "Leave Requests", to: "/dashboard/leave", icon: CalendarOff },
          { label: "Tasks", to: "/dashboard/tasks", icon: CheckSquare },
          { label: "Calendar", to: "/dashboard/calendar", icon: Calendar },
          { label: "Events", to: "/dashboard/events", icon: CalendarRange },
        ],
      },
      {
        label: "Reporting & Finance",
        items: [
          { label: "Branch Reports", to: "/dashboard/reports", icon: FileBarChart },
          { label: "Remittance", to: "/dashboard/finance", icon: Wallet },
          { label: "Compliance", to: "/dashboard/compliance", icon: ShieldCheck },
        ],
      },
      {
        label: "Communication",
        items: [
          { label: "Inbox", to: "/dashboard/inbox", icon: Inbox },
          { label: "Announcements", to: "/dashboard/announcements", icon: Megaphone },
          { label: "Documents", to: "/dashboard/documents", icon: FolderOpen },
        ],
      },
      {
        label: "Account",
        items: [
          { label: "My Wallet", to: "/dashboard/wallet/my", icon: Wallet },
          { label: "Settings", to: "/dashboard/settings", icon: Settings },
        ],
      },
    ],
    BRANCH_PASTOR: [
      { label: "", items: [{ label: "Overview", to: "/dashboard", icon: LayoutDashboard }] },
      {
        label: "My Branch",
        items: [
          { label: "Branch Profile", to: "/dashboard/branches", icon: Building2 },
          { label: "Weekly Reports", to: "/dashboard/reports/weekly", icon: ClipboardList },
          { label: "Monthly Summary", to: "/dashboard/reports/monthly", icon: FileBarChart },
          { label: "Staff", to: "/dashboard/staff", icon: UserCog },
          { label: "Service Planner", to: "/dashboard/services", icon: Music },
        ],
      },
      {
        label: "Personal",
        items: [
          { label: "Apply for Leave", to: "/dashboard/leave/apply", icon: CalendarOff },
          { label: "My Leave", to: "/dashboard/leave/my", icon: Calendar },
        ],
      },
      {
        label: "Work",
        items: [
          { label: "Tasks", to: "/dashboard/tasks", icon: CheckSquare },
          { label: "Calendar", to: "/dashboard/calendar", icon: Calendar },
        ],
      },
      {
        label: "Communication",
        items: [
          { label: "Events", to: "/dashboard/events", icon: CalendarRange },
          { label: "Announcements", to: "/dashboard/announcements", icon: Megaphone },
          { label: "Documents", to: "/dashboard/documents", icon: FolderOpen },
        ],
      },
      {
        label: "Account",
        items: [
          { label: "My Wallet", to: "/dashboard/wallet/my", icon: Wallet },
          { label: "Settings", to: "/dashboard/settings", icon: Settings },
        ],
      },
    ],
    STAFF: [
      { label: "", items: [{ label: "Overview", to: "/dashboard", icon: LayoutDashboard }] },
      {
        label: "Branch",
        items: [
          { label: "Events", to: "/dashboard/events", icon: CalendarRange },
          { label: "Service Planner", to: "/dashboard/services", icon: Music },
          { label: "Tasks", to: "/dashboard/tasks", icon: CheckSquare },
          { label: "Calendar", to: "/dashboard/calendar", icon: Calendar },
          { label: "Inbox", to: "/dashboard/inbox", icon: Inbox },
          { label: "Announcements", to: "/dashboard/announcements", icon: Megaphone },
          { label: "Documents", to: "/dashboard/documents", icon: FolderOpen },
          { label: "My Wallet", to: "/dashboard/wallet/my", icon: Wallet },
        ],
      },
    ],
  };

  return maps[role];
}

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { role, user, signOut } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { pendingApprovalsCount } = useMockStore();
  const groups = buildNav(role, pendingApprovalsCount({ role, user }));

  const isActive = (to: string) => {
    if (to === "/dashboard") return pathname === "/dashboard";
    return pathname === to || pathname.startsWith(to + "/");
  };

  return (
    <aside className="sidebar-gradient flex h-full w-64 flex-col border-r border-[var(--border-sidebar)]">
      <div className="flex items-center gap-3 border-b border-[var(--border-sidebar)] px-5 py-5">
        <img
          src="/images/jnic-logo-transparent.png"
          alt="Jubilee Nation International Churches"
          className="h-10 w-10 shrink-0 object-contain"
        />
        <div className="leading-tight">
          <div className="font-display text-[var(--accent-primary)] font-bold text-base tracking-tight">
            JNLOP
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-sidebar-muted)]">
            Jubilee Nation
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((g, gi) => (
          <div key={gi}>
            {g.label && (
              <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-sidebar-muted)]">
                {g.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(it.to);
                const Icon = it.icon;
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      onClick={onNavigate}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                        active
                          ? "bg-[var(--bg-sidebar-surface)] text-[var(--text-sidebar)] font-medium shadow-sm"
                          : "text-[var(--text-sidebar-muted)] hover:text-[var(--text-sidebar)] hover:bg-[var(--bg-sidebar-surface)]/60",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                      )}
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{it.label}</span>
                      {it.badge !== undefined && it.badge > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent-primary)] px-1.5 text-[10px] font-semibold text-white">
                          {it.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--border-sidebar)] p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-semibold text-sm border border-[var(--accent-primary)]/30">
            {initials(user.firstName, user.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium text-[var(--text-sidebar)]">
              {user.firstName} {user.lastName}
            </div>
            <div className="truncate text-[10px] uppercase tracking-wider text-[var(--text-sidebar-muted)]">
              {ROLE_LABELS[role]}
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-[var(--text-sidebar-muted)] hover:text-[var(--text-sidebar)] p-1.5 rounded-md hover:bg-[var(--bg-sidebar-surface)]"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
