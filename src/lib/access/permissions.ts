import type { Role } from "@/lib/data/types";

export type RoutePath =
  | "/dashboard"
  | "/dashboard/org-structure"
  | "/dashboard/branches"
  | "/dashboard/pastors"
  | "/dashboard/staff"
  | "/dashboard/transfers"
  | "/dashboard/leave"
  | "/dashboard/leave/apply"
  | "/dashboard/leave/my"
  | "/dashboard/events"
  | "/dashboard/reports"
  | "/dashboard/reports/submit"
  | "/dashboard/reports/weekly"
  | "/dashboard/reports/weekly/submit"
  | "/dashboard/reports/monthly"
  | "/dashboard/reports/builder"
  | "/dashboard/finance"
  | "/dashboard/wallet"
  | "/dashboard/wallet/my"
  | "/dashboard/announcements"
  | "/dashboard/documents"
  | "/dashboard/analytics"
  | "/dashboard/settings"
  | "/dashboard/approvals"
  | "/dashboard/tasks"
  | "/dashboard/calendar"
  | "/dashboard/compliance"
  | "/dashboard/audit"
  | "/dashboard/search"
  | "/dashboard/impact"
  | "/dashboard/inbox"
  | "/dashboard/services";

const HQ_ROLES: Role[] = ["HQ_ADMIN", "GENERAL_OVERSEER"];
const STATE_ROLES: Role[] = [...HQ_ROLES, "STATE_PASTOR"];
const BRANCH_ROLES: Role[] = [...STATE_ROLES, "BRANCH_PASTOR"];
const ALL_ROLES: Role[] = [...BRANCH_ROLES, "STAFF"];

export const ROUTE_PERMISSIONS: Record<RoutePath, Role[]> = {
  "/dashboard": ALL_ROLES,
  "/dashboard/org-structure": HQ_ROLES,
  "/dashboard/branches": BRANCH_ROLES.concat("STAFF"),
  "/dashboard/pastors": STATE_ROLES,
  "/dashboard/staff": ["HQ_ADMIN", "STATE_PASTOR", "BRANCH_PASTOR"],
  "/dashboard/transfers": STATE_ROLES,
  "/dashboard/leave": STATE_ROLES,
  "/dashboard/leave/apply": ["BRANCH_PASTOR"],
  "/dashboard/leave/my": ["BRANCH_PASTOR"],
  "/dashboard/events": ALL_ROLES,
  "/dashboard/reports": STATE_ROLES,
  "/dashboard/reports/submit": STATE_ROLES,
  "/dashboard/reports/weekly": ["BRANCH_PASTOR"],
  "/dashboard/reports/weekly/submit": ["BRANCH_PASTOR"],
  "/dashboard/reports/monthly": ["BRANCH_PASTOR"],
  "/dashboard/reports/builder": HQ_ROLES,
  "/dashboard/finance": STATE_ROLES,
  "/dashboard/wallet": ["HQ_ADMIN"],
  "/dashboard/wallet/my": ["HQ_ADMIN", "STATE_PASTOR", "BRANCH_PASTOR", "STAFF"],
  "/dashboard/announcements": ALL_ROLES,
  "/dashboard/documents": ALL_ROLES,
  "/dashboard/analytics": HQ_ROLES,
  "/dashboard/settings": ALL_ROLES,
  "/dashboard/approvals": STATE_ROLES,
  "/dashboard/tasks": ALL_ROLES,
  "/dashboard/calendar": ALL_ROLES,
  "/dashboard/compliance": STATE_ROLES,
  "/dashboard/audit": HQ_ROLES,
  "/dashboard/search": ["HQ_ADMIN", "GENERAL_OVERSEER", "STATE_PASTOR"],
  "/dashboard/impact": HQ_ROLES,
  "/dashboard/inbox": ["HQ_ADMIN", "GENERAL_OVERSEER", "STATE_PASTOR", "STAFF"],
  "/dashboard/services": ["BRANCH_PASTOR", "STAFF"],
};

export function canAccessRoute(role: Role, pathname: string): boolean {
  if (pathname.startsWith("/dashboard/pastors/")) {
    return ROUTE_PERMISSIONS["/dashboard/pastors"].includes(role);
  }
  if (pathname.startsWith("/dashboard/events/")) {
    return ROUTE_PERMISSIONS["/dashboard/events"].includes(role);
  }

  const exact = pathname.replace(/\/$/, "") || "/dashboard";
  const key = exact as RoutePath;
  if (ROUTE_PERMISSIONS[key]) {
    return ROUTE_PERMISSIONS[key].includes(role);
  }
  return exact.startsWith("/dashboard");
}

export function getAllowedRoutes(role: Role): RoutePath[] {
  return (Object.entries(ROUTE_PERMISSIONS) as [RoutePath, Role[]][])
    .filter(([, roles]) => roles.includes(role))
    .map(([path]) => path);
}

export const ROUTE_LABELS: Record<RoutePath, string> = {
  "/dashboard": "Overview",
  "/dashboard/org-structure": "Org Structure",
  "/dashboard/branches": "Branch Directory",
  "/dashboard/pastors": "Pastor Directory",
  "/dashboard/staff": "Staff Directory",
  "/dashboard/transfers": "Transfers",
  "/dashboard/leave": "Leave Management",
  "/dashboard/leave/apply": "Apply for Leave",
  "/dashboard/leave/my": "My Leave",
  "/dashboard/events": "Events",
  "/dashboard/reports": "Branch Reports",
  "/dashboard/reports/submit": "Submit Report",
  "/dashboard/reports/weekly": "Weekly Reports",
  "/dashboard/reports/weekly/submit": "Submit Weekly Report",
  "/dashboard/reports/monthly": "Monthly Summary",
  "/dashboard/reports/builder": "Reports Builder",
  "/dashboard/finance": "Finance & Remittance",
  "/dashboard/wallet": "Payroll Wallet",
  "/dashboard/wallet/my": "My Wallet",
  "/dashboard/announcements": "Announcements",
  "/dashboard/documents": "Documents",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
  "/dashboard/approvals": "Approval Center",
  "/dashboard/tasks": "Tasks & Assignments",
  "/dashboard/calendar": "Calendar",
  "/dashboard/compliance": "Compliance Tracker",
  "/dashboard/audit": "Audit Log",
  "/dashboard/search": "People Search",
  "/dashboard/impact": "Ministry Impact",
  "/dashboard/inbox": "Inbox",
  "/dashboard/services": "Service Planner",
};
