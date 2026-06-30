import * as React from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronRight, Menu, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { useMockStore } from "@/lib/data/mock-store";
import { NotificationsPanel } from "./notifications-panel";
import { RoleSwitcher } from "./role-switcher";
import { CommandPalette, useCommandPalette } from "./command-palette";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/org-structure": "Organisation / Org Structure",
  "/dashboard/branches": "Organisation / Branch Directory",
  "/dashboard/pastors": "People / Pastor Directory",
  "/dashboard/staff": "People / Staff Directory",
  "/dashboard/transfers": "Operations / Transfers",
  "/dashboard/leave": "Operations / Leave Management",
  "/dashboard/leave/apply": "Personal / Apply for Leave",
  "/dashboard/leave/my": "Personal / My Leave",
  "/dashboard/events": "Operations / Events",
  "/dashboard/reports": "Reporting / Branch Reports",
  "/dashboard/reports/submit": "Reporting / Submit Report",
  "/dashboard/reports/weekly": "My Branch / Weekly Reports",
  "/dashboard/reports/weekly/submit": "My Branch / Submit Weekly Report",
  "/dashboard/reports/monthly": "My Branch / Monthly Summary",
  "/dashboard/reports/builder": "Reporting / Reports Builder",
  "/dashboard/finance": "Reporting / Finance & Remittance",
  "/dashboard/announcements": "Communication / Announcements",
  "/dashboard/documents": "Communication / Documents",
  "/dashboard/analytics": "Insights / Analytics",
  "/dashboard/settings": "Settings",
  "/dashboard/approvals": "Operations / Approval Center",
  "/dashboard/tasks": "Operations / Tasks",
  "/dashboard/calendar": "Operations / Calendar",
  "/dashboard/compliance": "Reporting / Compliance",
  "/dashboard/audit": "Insights / Audit Log",
  "/dashboard/search": "People / Search",
  "/dashboard/impact": "Insights / Ministry Impact",
  "/dashboard/inbox": "Communication / Inbox",
  "/dashboard/services": "Branch / Service Planner",
};

function getBreadcrumb(pathname: string): string {
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];
  if (pathname.startsWith("/dashboard/pastors/")) return "People / Pastor Profile";
  if (pathname.startsWith("/dashboard/events/")) return "Operations / Event Detail";
  return "Dashboard";
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useRole();
  const navigate = useNavigate();
  const { notifications } = useMockStore();
  const [openNotif, setOpenNotif] = React.useState(false);
  const { open: cmdOpen, setOpen: setCmdOpen } = useCommandPalette();
  const unread = notifications.filter((n) => !n.read).length;

  const crumbParts = getBreadcrumb(pathname).split(" / ");

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[--border-default] bg-[--bg-surface]/95 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 rounded-md hover:bg-[--bg-base] text-[--text-muted]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
            {crumbParts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-[--text-muted] shrink-0" />}
                <span
                  className={cn(
                    "truncate",
                    i === crumbParts.length - 1
                      ? "font-display text-[--text-primary] font-medium"
                      : "text-[--text-muted]",
                  )}
                >
                  {part}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden md:inline-flex items-center gap-2 rounded-lg border border-[--border-default] bg-[--bg-base] px-3 py-1.5 text-xs text-[--text-muted] hover:bg-[--bg-subtle] transition-colors"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search…</span>
            <kbd className="ml-2 rounded border border-[--border-default] bg-[--bg-surface] px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>

          <RoleSwitcher />

          <button
            onClick={() => setOpenNotif(true)}
            className="relative p-2 rounded-lg hover:bg-[--bg-base] text-[--text-muted]"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[--state-error] px-1 text-[10px] font-semibold text-white font-mono">
                {unread}
              </span>
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:bg-[--bg-base] p-1 pr-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-xs font-semibold">
                {initials(user.firstName, user.lastName)}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-[--text-muted] font-normal">{user.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/settings" })}>
                Profile & Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <NotificationsPanel open={openNotif} onClose={() => setOpenNotif(false)} />
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  );
}
