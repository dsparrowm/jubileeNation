import * as React from "react";
import type { Role } from "@/lib/data/types";
import { mockUser, mockUserDefaultRole } from "@/lib/auth/mock-user";

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
  user: typeof mockUser;
}

const Ctx = React.createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>(mockUserDefaultRole);

  // Persist client-side only
  React.useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("jnlop:role") : null;
    if (saved) setRoleState(saved as Role);
  }, []);

  const setRole = React.useCallback((r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") window.localStorage.setItem("jnlop:role", r);
  }, []);

  return <Ctx.Provider value={{ role, setRole, user: mockUser }}>{children}</Ctx.Provider>;
}

export function useRole() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useRole must be used inside RoleProvider");
  return v;
}

export const ROLE_LABELS: Record<Role, string> = {
  GENERAL_OVERSEER: "General Overseer",
  HQ_ADMIN: "HQ Admin",
  STATE_PASTOR: "State Pastor",
  BRANCH_PASTOR: "Branch Pastor",
  STAFF: "Staff",
};
