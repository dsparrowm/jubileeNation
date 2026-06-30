import * as React from "react";
import type { Pastor, Role } from "@/lib/data/types";
import {
  demoAccounts,
  findDemoAccount,
  mockUser,
  mockUserDefaultRole,
  DEMO_STORAGE_KEY,
  clearDemoSession,
} from "@/lib/auth/mock-user";

interface RoleContextValue {
  role: Role;
  setDemoAccount: (email: string) => void;
  signOut: () => void;
  user: Pastor;
  isReady: boolean;
}

const Ctx = React.createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>(mockUserDefaultRole);
  const [user, setUser] = React.useState<Pastor>(mockUser);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const savedEmail =
      typeof window !== "undefined" ? window.localStorage.getItem(DEMO_STORAGE_KEY) : null;
    const account = savedEmail ? findDemoAccount(savedEmail) : null;
    if (account) {
      setRoleState(account.role);
      setUser(account.user);
    }
    setIsReady(true);
  }, []);

  const setDemoAccount = React.useCallback((email: string) => {
    const account = findDemoAccount(email);
    if (!account) return;

    setRoleState(account.role);
    setUser(account.user);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DEMO_STORAGE_KEY, account.email);
    }
  }, []);

  const signOut = React.useCallback(() => {
    clearDemoSession();
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
  }, []);

  return (
    <Ctx.Provider value={{ role, setDemoAccount, signOut, user, isReady }}>{children}</Ctx.Provider>
  );
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

export { demoAccounts };
