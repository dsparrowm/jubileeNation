import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { RoleProvider } from "@/lib/role-context";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "JNLOP — Jubilee Nation Leadership & Operations Platform" },
      { name: "description", content: "Internal management platform for Jubilee Nation International Churches." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-[--bg-base] px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-7xl font-bold text-[--text-primary]">404</h1>
        <p className="mt-2 text-sm text-[--text-muted]">This page does not exist.</p>
        <Link to="/dashboard" className="mt-6 inline-flex rounded-md bg-[--accent-primary] px-4 py-2 text-sm font-medium text-white hover:bg-[--accent-hover]">
          Back to Dashboard
        </Link>
      </div>
    </div>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <Outlet />
        <Toaster />
      </RoleProvider>
    </QueryClientProvider>
  );
}
