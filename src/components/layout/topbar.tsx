import * as React from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronRight, Menu, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole, ROLE_LABELS } from "@/lib/role-context";
import { notifications } from "@/lib/data/seed";
import { NotificationsPanel } from "./notifications-panel";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/org-structure": "Organisation / Org Structure",
  "/dashboard/branches": "Organisation / Branch Directory",
  "/dashboard/pastors": "People / Pastor Directory",
  "/dashboard/staff": "People / Staff Directory",
  "/dashboard/transfers": "Operations / Transfers & Appointments",
  "/dashboard/leave": "Operations / Leave Management",
  "/dashboard/leave/apply": "Operations / Apply for Leave",
  "/dashboard/events": "Operations / Events & Programmes",
  "/dashboard/reports": "Reporting / Branch Reports",
  "/dashboard/reports/submit": "Reporting / Submit Report",
  "/dashboard/finance": "Reporting / Finance & Remittance",
  "/dashboard/announcements": "Communication / Announcements",
  "/dashboard/documents": "Communication / Document Library",
  "/dashboard/analytics": "Insights / Executive Analytics",
  "/dashboard/settings": "Settings",
};

function getBreadcrumb(pathname: string): string {
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];
  // dynamic profile
  if (pathname.startsWith("/dashboard/pastors/")) return "People / Pastor Profile";
  if (pathname.startsWith("/dashboard/events/")) return "Operations / Event Detail";
  return "Dashboard";
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role, user } = useRole();
  const navigate = useNavigate();
  const [openNotif, setOpenNotif] = React.useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const crumbParts = getBreadcrumb(pathname).split(" / ");

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[--border-default] bg-[--bg-surface] px-4 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 rounded-md hover:bg-[--bg-base] text-[--text-muted]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <nav className="flex items-center gap-1.5 text-sm min-w-0">
            {crumbParts.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-[--text-muted] shrink-0" />}
                <span
                  className={cn(
                    "truncate",
                    i === crumbParts.length - 1
                      ? "text-[--text-primary] font-medium"
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
          <div className="hidden items-center gap-2 rounded-md border border-[--border-default] bg-[--bg-base] px-2.5 py-1.5 text-xs font-medium text-[--text-primary] sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5 text-[--accent-primary]" />
            <span className="text-[--accent-primary]">{ROLE_LABELS[role]}</span>
          </div>

          {/* Notifications */}
          <button
            onClick={() => setOpenNotif(true)}
            className="relative p-2 rounded-md hover:bg-[--bg-base] text-[--text-muted]"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[--state-error] px-1 text-[10px] font-semibold text-white font-mono">
                {unread}
              </span>
            )}
          </button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:bg-[--bg-base] p-1 pr-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[--bg-sidebar] text-white text-xs font-semibold">
                {user.firstName[0]}
                {user.lastName[0]}
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
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/settings" })}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/login" })}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <NotificationsPanel open={openNotif} onClose={() => setOpenNotif(false)} />
    </>
  );
}
