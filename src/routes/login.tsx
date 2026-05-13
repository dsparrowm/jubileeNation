import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { demoAccounts, findDemoAccount } from "@/lib/auth/mock-user";
import { ROLE_LABELS, useRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { setDemoAccount } = useRole();
  const [showPw, setShowPw] = React.useState(false);
  const [email, setEmail] = React.useState("admin@jnic.org");
  const [pw, setPw] = React.useState("password");
  const [errors, setErrors] = React.useState<{ email?: string; pw?: string }>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    const account = findDemoAccount(email);
    if (!account) errs.email = "Use one of the demo accounts below";
    if (!pw) errs.pw = "Password is required";
    if (account && pw !== account.password) errs.pw = "Use the demo password: password";
    setErrors(errs);
    if (account && Object.keys(errs).length === 0) {
      setDemoAccount(account.email);
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[--bg-base] px-5 py-10">
      <section className="w-full max-w-[440px]">
        <div className="mb-10 flex flex-col items-center text-center">
          <img
            src="/images/jnic-logo-transparent.png"
            alt="Jubilee Nation International Churches"
            className="h-20 w-auto max-w-full"
          />
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[--text-primary]">
            Welcome back
          </h1>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-[--text-muted]">
            Sign in to continue to the leadership workspace.
          </p>
        </div>

        <div className="rounded-2xl border border-[--border-default] bg-white p-6 shadow-[0_18px_50px_rgba(17,24,39,0.08)] sm:p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-[--text-primary]">Email address</label>
              <div className="mt-2 relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[--text-muted]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-lg border border-[--border-default] bg-white pl-11 pr-4 text-sm text-[--text-primary] outline-none transition focus:border-[--accent-primary] focus:ring-4 focus:ring-[--accent-primary]/15"
                  placeholder="you@jnic.org"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-2 text-xs text-[--state-error]">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-[--text-primary]">Password</label>
                <a
                  href="#"
                  className="text-xs font-medium text-[--accent-primary] hover:text-[--accent-hover]"
                >
                  Forgot password?
                </a>
              </div>
              <div className="mt-2 relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[--text-muted]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="h-12 w-full rounded-lg border border-[--border-default] bg-white pl-11 pr-12 text-sm text-[--text-primary] outline-none transition focus:border-[--accent-primary] focus:ring-4 focus:ring-[--accent-primary]/15"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[--text-muted] transition hover:text-[--text-primary]"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.pw && <p className="mt-2 text-xs text-[--state-error]">{errors.pw}</p>}
            </div>

            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-3 text-sm text-[--text-primary]">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-[--border-default] text-[--accent-primary] focus:ring-[--accent-primary]"
                />
                <span>Remember me</span>
              </label>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-lg !bg-[var(--bg-sidebar)] text-sm font-semibold !text-white shadow-sm transition hover:!bg-[var(--bg-sidebar-surface)]"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 border-t border-[--border-default] pt-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[--text-muted]">
              Demo accounts
            </p>
            <div className="mt-3 grid gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPw(account.password);
                    setErrors({});
                  }}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[--border-default] px-3 py-2 text-left text-sm transition hover:border-[--accent-primary] hover:bg-[--bg-base]"
                >
                  <span className="font-medium text-[--text-primary]">{account.email}</span>
                  <span className="shrink-0 text-xs text-[--text-muted]">
                    {ROLE_LABELS[account.role]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-center text-sm leading-6 text-[--text-muted]">
            Need access? Contact your{" "}
            <Link
              to="/login"
              className="font-medium text-[--accent-hover] hover:text-[--accent-primary]"
            >
              State Pastor
            </Link>{" "}
            or HQ office.
          </p>
        </div>
      </section>
    </main>
  );
}
