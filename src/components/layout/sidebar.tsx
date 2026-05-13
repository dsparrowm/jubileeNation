import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Building2, Users, UserCog, ArrowLeftRight, CalendarOff,
  CalendarRange, FileBarChart, Wallet, Megaphone, FolderOpen, BarChart3,
  Settings, LogOut, Network, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole, ROLE_LABELS } from "@/lib/role-context";
import type { Role } from "@/lib/data/types";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

const navByRole: Record<Role, NavGroup[]> = {
  HQ_ADMIN: [
    { label: "", items: [{ label: "Overview", to: "/dashboard", icon: LayoutDashboard }] },
    { label: "Organisation", items: [
      { label: "Org Structure", to: "/dashboard/org-structure", icon: Network },
      { label: "Branch Directory", to: "/dashboard/branches", icon: Building2 },
    ]},
    { label: "People", items: [
      { label: "Pastor Directory", to: "/dashboard/pastors", icon: Users },
      { label: "Staff Directory", to: "/dashboard/staff", icon: UserCog },
    ]},
    { label: "Operations", items: [
      { label: "Transfers", to: "/dashboard/transfers", icon: ArrowLeftRight },
      { label: "Leave", to: "/dashboard/leave", icon: CalendarOff },
      { label: "Events", to: "/dashboard/events", icon: CalendarRange },
    ]},
    { label: "Reporting", items: [
      { label: "Branch Reports", to: "/dashboard/reports", icon: FileBarChart },
      { label: "Finance", to: "/dashboard/finance", icon: Wallet },
    ]},
    { label: "Communication", items: [
      { label: "Announcements", to: "/dashboard/announcements", icon: Megaphone },
      { label: "Documents", to: "/dashboard/documents", icon: FolderOpen },
    ]},
    { label: "Insights", items: [
      { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
      { label: "Settings", to: "/dashboard/settings", icon: Settings },
    ]},
  ],
  GENERAL_OVERSEER: [
    { label: "", items: [{ label: "Overview", to: "/dashboard", icon: LayoutDashboard }] },
    { label: "Organisation", items: [
      { label: "Org Structure", to: "/dashboard/org-structure", icon: Network },
      { label: "Branch Directory", to: "/dashboard/branches", icon: Building2 },
    ]},
    { label: "People", items: [
      { label: "Pastor Directory", to: "/dashboard/pastors", icon: Users },
    ]},
    { label: "Operations", items: [
      { label: "Transfers", to: "/dashboard/transfers", icon: ArrowLeftRight },
      { label: "Leave", to: "/dashboard/leave", icon: CalendarOff },
      { label: "Events", to: "/dashboard/events", icon: CalendarRange },
    ]},
    { label: "Reporting", items: [
      { label: "Branch Reports", to: "/dashboard/reports", icon: FileBarChart },
      { label: "Finance", to: "/dashboard/finance", icon: Wallet },
    ]},
    { label: "Communication", items: [
      { label: "Announcements", to: "/dashboard/announcements", icon: Megaphone },
      { label: "Documents", to: "/dashboard/documents", icon: FolderOpen },
    ]},
    { label: "Insights", items: [
      { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
    ]},
  ],
  STATE_PASTOR: [
    { label: "", items: [{ label: "Overview", to: "/dashboard", icon: LayoutDashboard }] },
    { label: "My State", items: [
      { label: "State Branches", to: "/dashboard/branches", icon: Building2 },
      { label: "Pastors", to: "/dashboard/pastors", icon: Users },
    ]},
    { label: "Operations", items: [
      { label: "Transfers", to: "/dashboard/transfers", icon: ArrowLeftRight },
      { label: "Leave Requests", to: "/dashboard/leave", icon: CalendarOff },
    ]},
    { label: "Reporting", items: [
      { label: "Branch Reports", to: "/dashboard/reports", icon: FileBarChart },
      { label: "Remittance", to: "/dashboard/finance", icon: Wallet },
    ]},
    { label: "Communication", items: [
      { label: "Announcements", to: "/dashboard/announcements", icon: Megaphone },
      { label: "Documents", to: "/dashboard/documents", icon: FolderOpen },
    ]},
  ],
  BRANCH_PASTOR: [
    { label: "", items: [{ label: "Overview", to: "/dashboard", icon: LayoutDashboard }] },
    { label: "My Branch", items: [
      { label: "Branch Profile", to: "/dashboard/branches", icon: Building2 },
      { label: "Submit Report", to: "/dashboard/reports/submit", icon: ClipboardList },
      { label: "Apply for Leave", to: "/dashboard/leave/apply", icon: CalendarOff },
    ]},
    { label: "Communication", items: [
      { label: "Events", to: "/dashboard/events", icon: CalendarRange },
      { label: "Announcements", to: "/dashboard/announcements", icon: Megaphone },
      { label: "Documents", to: "/dashboard/documents", icon: FolderOpen },
    ]},
  ],
  STAFF: [
    { label: "", items: [{ label: "Overview", to: "/dashboard", icon: LayoutDashboard }] },
    { label: "Branch", items: [
      { label: "Events", to: "/dashboard/events", icon: CalendarRange },
      { label: "Announcements", to: "/dashboard/announcements", icon: Megaphone },
      { label: "Documents", to: "/dashboard/documents", icon: FolderOpen },
    ]},
  ],
};

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { role, user } = useRole();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const groups = navByRole[role];

  const isActive = (to: string) => {
    if (to === "/dashboard") return pathname === "/dashboard";
    return pathname === to || pathname.startsWith(to + "/");
  };

  return (
    <aside className="flex h-full w-60 flex-col bg-[--bg-sidebar] border-r border-[--border-sidebar]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[--border-sidebar]">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[--accent-primary] text-white font-bold">
          J
        </div>
        <div className="leading-tight">
          <div className="text-[--accent-primary] font-bold text-base tracking-tight">JNLOP</div>
          <div className="text-[10px] uppercase tracking-wider text-[--text-sidebar-muted]">Jubilee Nation</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((g, gi) => (
          <div key={gi}>
            {g.label && (
              <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[--text-sidebar-muted]">
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
                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-[--bg-sidebar-surface] text-[--text-sidebar] font-medium"
                          : "text-[--text-sidebar-muted] hover:text-[--text-sidebar] hover:bg-[--bg-sidebar-surface]/60"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[--accent-primary]" />
                      )}
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-[--border-sidebar] p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[--accent-primary]/20 text-[--accent-primary] font-semibold text-sm border border-[--accent-primary]/30">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium text-[--text-sidebar]">
              {user.firstName} {user.lastName}
            </div>
            <div className="truncate text-[10px] uppercase tracking-wider text-[--text-sidebar-muted]">
              {ROLE_LABELS[role]}
            </div>
          </div>
          <Link
            to="/login"
            className="text-[--text-sidebar-muted] hover:text-[--text-sidebar] p-1.5 rounded-md hover:bg-[--bg-sidebar-surface]"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
