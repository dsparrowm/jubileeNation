import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = React.useState(false);
  const [email, setEmail] = React.useState("admin@jnic.org");
  const [pw, setPw] = React.useState("password");
  const [errors, setErrors] = React.useState<{ email?: string; pw?: string }>({});

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.includes("@")) errs.email = "Enter a valid email address";
    if (pw.length < 4) errs.pw = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-[--bg-sidebar] text-[--text-sidebar] p-12 overflow-hidden">
        {/* Pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 30%, #C9A050 0, transparent 35%), radial-gradient(circle at 80% 70%, #ffffff 0, transparent 30%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 49%, #ffffff 49%, #ffffff 51%, transparent 51%)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[--accent-primary] text-white font-bold text-lg">
            J
          </div>
          <div>
            <div className="text-[--accent-primary] font-bold text-lg leading-none">JNLOP</div>
            <div className="text-[10px] uppercase tracking-widest text-[--text-sidebar-muted] mt-1">
              Jubilee Nation Int'l Churches
            </div>
          </div>
        </div>

        <div className="relative">
          <blockquote className="text-2xl font-semibold leading-snug text-[--text-sidebar] max-w-md">
            "And I will give you shepherds after my own heart, who will lead you with knowledge and understanding."
          </blockquote>
          <p className="mt-3 text-sm text-[--text-sidebar-muted]">— Jeremiah 3:15</p>
        </div>

        <div className="relative text-xs text-[--text-sidebar-muted]">
          © {new Date().getFullYear()} Jubilee Nation International Churches. Internal use only.
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-[--bg-base]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[--accent-primary] text-white font-bold">J</div>
            <div>
              <div className="text-[--accent-primary] font-bold">JNLOP</div>
              <div className="text-[10px] uppercase tracking-wider text-[--text-muted]">Jubilee Nation</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[--text-primary]">Welcome back</h1>
          <p className="mt-1 text-sm text-[--text-muted]">Sign in to access the management platform.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-[--text-primary]">Email address</label>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-muted]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-[--border-default] bg-[--bg-surface] pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--accent-primary]/40 focus:border-[--accent-primary]"
                  placeholder="you@jnic.org"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-[--state-error]">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[--text-primary]">Password</label>
                <a href="#" className="text-xs text-[--accent-primary] hover:text-[--accent-hover] font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--text-muted]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="w-full rounded-md border border-[--border-default] bg-[--bg-surface] pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[--accent-primary]/40 focus:border-[--accent-primary]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-[--text-primary]"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.pw && <p className="mt-1 text-xs text-[--state-error]">{errors.pw}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm text-[--text-primary]">
              <input type="checkbox" defaultChecked className="rounded border-[--border-default] text-[--accent-primary] focus:ring-[--accent-primary]" />
              Remember me on this device
            </label>

            <Button
              type="submit"
              className="w-full bg-[--accent-primary] hover:bg-[--accent-hover] text-white font-medium py-2.5 h-auto"
            >
              Sign In
            </Button>

            <p className="text-center text-xs text-[--text-muted] pt-2">
              Need access? Contact your <Link to="/login" className="text-[--accent-primary] font-medium">State Pastor</Link> or HQ Office.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
