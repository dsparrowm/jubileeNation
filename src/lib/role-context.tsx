import * as React from "react";
import type { Pastor, Role } from "@/lib/data/types";
import { demoAccounts, findDemoAccount, mockUser, mockUserDefaultRole } from "@/lib/auth/mock-user";

interface RoleContextValue {
  role: Role;
  setDemoAccount: (email: string) => void;
  user: Pastor;
}

const Ctx = React.createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>(mockUserDefaultRole);
  const [user, setUser] = React.useState<Pastor>(mockUser);

  // Persist client-side only
  React.useEffect(() => {
    const savedEmail =
      typeof window !== "undefined" ? window.localStorage.getItem("jnlop:demo-email") : null;
    const account = savedEmail ? findDemoAccount(savedEmail) : demoAccounts[0];
    if (account) {
      setRoleState(account.role);
      setUser(account.user);
    }
  }, []);

  const setDemoAccount = React.useCallback((email: string) => {
    const account = findDemoAccount(email);
    if (!account) return;

    setRoleState(account.role);
    setUser(account.user);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jnlop:demo-email", account.email);
    }
  }, []);

  return <Ctx.Provider value={{ role, setDemoAccount, user }}>{children}</Ctx.Provider>;
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
