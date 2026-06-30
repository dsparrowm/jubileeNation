import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";
import { isAuthenticated, findDemoAccount, getDemoEmail } from "@/lib/auth/mock-user";
import { canAccessRoute } from "@/lib/access/permissions";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined") {
      if (!isAuthenticated()) {
        throw redirect({ to: "/login" });
      }
      const email = getDemoEmail();
      const account = email ? findDemoAccount(email) : null;
      if (account && !canAccessRoute(account.role, location.pathname)) {
        throw redirect({ to: "/dashboard" });
      }
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex bg-[--bg-base]">
      <div className="hidden md:block shrink-0">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-60 shadow-2xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <div className={cn("flex-1 px-4 md:px-6 py-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300")}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
