import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { findDemoAccount } from "@/lib/auth/mock-user";
import { useRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";

const defaultAccount = findDemoAccount("go@jnic.org")!;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { setDemoAccount } = useRole();
  const [showPw, setShowPw] = React.useState(false);
  const [email, setEmail] = React.useState(defaultAccount.email);
  const [pw, setPw] = React.useState(defaultAccount.password);
  const [errors, setErrors] = React.useState<{ email?: string; pw?: string }>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    const account = findDemoAccount(email);
    if (!account) errs.email = "No account found for this email";
    if (!pw) errs.pw = "Password is required";
    if (account && pw !== account.password) errs.pw = "Incorrect password";
    setErrors(errs);
    if (account && Object.keys(errs).length === 0) {
      setDemoAccount(account.email);
      window.location.assign("/dashboard");
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Hero */}
      <section className="sidebar-gradient relative hidden min-h-screen overflow-hidden p-12 text-white lg:block lg:w-1/2">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--accent-primary)] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[var(--accent-primary)] blur-3xl" />
        </div>
        <img
          src="/images/jnic-logo-transparent.png"
          alt="JNIC"
          className="absolute left-12 top-12 z-10 h-16 w-auto object-contain"
        />
        <div className="absolute inset-0 flex items-center justify-center px-12">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Jubilee Nation
              <br />
              <span className="text-[var(--accent-primary)]">Leadership Platform</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--text-sidebar-muted)]">
              Internal management platform for Jubilee Nation International Churches — unifying
              pastoral operations, reporting, and ministry oversight across Nigeria.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="flex flex-1 items-center justify-center bg-[--bg-base] px-5 py-10">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 lg:hidden flex flex-col items-center text-center">
            <img src="/images/jnic-logo-transparent.png" alt="JNIC" className="h-14 w-auto" />
            <h1 className="mt-3 font-display text-2xl font-bold">Welcome to JNLOP</h1>
          </div>

          <div className="rounded-2xl border border-[--border-default] bg-[--bg-surface] p-6 shadow-[var(--shadow-lg-token)] sm:p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-2 text-sm text-[--text-muted]">
              Access your leadership workspace.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-medium">Email address</label>
                <div className="mt-2 relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[--text-muted]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[--border-default] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[--accent-primary] focus:ring-4 focus:ring-[--accent-primary]/15"
                    placeholder="you@jnic.org"
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="mt-2 text-xs text-[--state-error]">{errors.email}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="mt-2 relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[--text-muted]" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[--border-default] bg-white pl-11 pr-12 text-sm outline-none transition focus:border-[--accent-primary] focus:ring-4 focus:ring-[--accent-primary]/15"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-primary]"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.pw && <p className="mt-2 text-xs text-[--state-error]">{errors.pw}</p>}
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl !bg-[var(--bg-sidebar)] text-sm font-semibold !text-white hover:!bg-[var(--bg-sidebar-surface)]"
              >
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
