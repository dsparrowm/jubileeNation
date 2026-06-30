import type { Pastor, Role } from "@/lib/data/types";
import { pastors, branches, findBranch } from "@/lib/data/seed";

export interface DemoAccount {
  email: string;
  password: string;
  role: Role;
  user: Pastor;
  description: string;
}

const makeDemoUser = (base: Pastor, overrides: Partial<Pastor>): Pastor => ({
  ...base,
  ...overrides,
});

// Rivers state pastor (p-001), Port Harcourt Central branch pastor (p-010), staff (p-011)
const riversStatePastor = pastors[0]; // Emeka Nwachukwu - st-rivers
const phCentralPastor = pastors.find((p) => p.branchId === "br-001" && p.rank === "Senior Pastor") ?? pastors[10];
const phCentralStaff = pastors.find((p) => p.branchId === "br-001" && p.rank === "Deacon") ?? pastors[11];

export const demoAccounts: DemoAccount[] = [
  {
    email: "admin@jnic.org",
    password: "password",
    role: "HQ_ADMIN",
    description: "Full platform access — operations & settings",
    user: makeDemoUser(pastors[0], {
      id: "demo-admin",
      firstName: "HQ",
      lastName: "Admin",
      email: "admin@jnic.org",
      rank: "State Pastor",
      branchId: null,
      stateId: "st-rivers",
    }),
  },
  {
    email: "go@jnic.org",
    password: "password",
    role: "GENERAL_OVERSEER",
    description: "Executive view — analytics & ministry impact",
    user: makeDemoUser(pastors[0], {
      id: "demo-general-overseer",
      firstName: "General",
      lastName: "Overseer",
      email: "go@jnic.org",
      rank: "State Pastor",
      branchId: null,
      stateId: "st-rivers",
    }),
  },
  {
    email: "state@jnic.org",
    password: "password",
    role: "STATE_PASTOR",
    description: "Full state admin — branches, approvals & reporting",
    user: makeDemoUser(riversStatePastor, {
      id: "demo-state-pastor",
      email: "state@jnic.org",
      firstName: riversStatePastor.firstName,
      lastName: riversStatePastor.lastName,
      stateId: "st-rivers",
      branchId: null,
      rank: "State Pastor",
    }),
  },
  {
    email: "branch@jnic.org",
    password: "password",
    role: "BRANCH_PASTOR",
    description: `${findBranch("br-001")?.name ?? "Port Harcourt Central"} — reports & branch ops`,
    user: makeDemoUser(phCentralPastor, {
      id: "demo-branch-pastor",
      email: "branch@jnic.org",
      branchId: "br-001",
      stateId: "st-rivers",
      rank: phCentralPastor.rank,
    }),
  },
  {
    email: "staff@jnic.org",
    password: "password",
    role: "STAFF",
    description: `${findBranch("br-001")?.name ?? "Port Harcourt Central"} — tasks, events & inbox`,
    user: makeDemoUser(phCentralStaff, {
      id: "demo-staff",
      email: "staff@jnic.org",
      branchId: "br-001",
      stateId: "st-rivers",
      rank: "Deacon",
    }),
  },
];

export function findDemoAccount(email: string) {
  return demoAccounts.find((account) => account.email === email.trim().toLowerCase());
}

export const mockUser: Pastor = demoAccounts[0].user;
export const mockUserDefaultRole: Role = "HQ_ADMIN";

export const DEMO_STORAGE_KEY = "jnlop:demo-email";

export function clearDemoSession() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(DEMO_STORAGE_KEY);
  }
}

export function getDemoEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DEMO_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  const email = getDemoEmail();
  return !!email && !!findDemoAccount(email);
}
