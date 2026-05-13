import type { Pastor, Role } from "@/lib/data/types";
import { pastors } from "@/lib/data/seed";

export interface DemoAccount {
  email: string;
  password: string;
  role: Role;
  user: Pastor;
}

const makeDemoUser = (base: Pastor, overrides: Partial<Pastor>): Pastor => ({
  ...base,
  ...overrides,
});

export const demoAccounts: DemoAccount[] = [
  {
    email: "admin@jnic.org",
    password: "password",
    role: "HQ_ADMIN",
    user: makeDemoUser(pastors[0], {
      id: "demo-admin",
      firstName: "HQ",
      lastName: "Admin",
      email: "admin@jnic.org",
      rank: "State Pastor",
      branchId: null,
    }),
  },
  {
    email: "go@jnic.org",
    password: "password",
    role: "GENERAL_OVERSEER",
    user: makeDemoUser(pastors[0], {
      id: "demo-general-overseer",
      firstName: "General",
      lastName: "Overseer",
      email: "go@jnic.org",
      rank: "State Pastor",
      branchId: null,
    }),
  },
  {
    email: "state@jnic.org",
    password: "password",
    role: "STATE_PASTOR",
    user: makeDemoUser(pastors[0], {
      email: "state@jnic.org",
    }),
  },
  {
    email: "branch@jnic.org",
    password: "password",
    role: "BRANCH_PASTOR",
    user: makeDemoUser(pastors[10], {
      email: "branch@jnic.org",
    }),
  },
  {
    email: "staff@jnic.org",
    password: "password",
    role: "STAFF",
    user: makeDemoUser(pastors[11], {
      email: "staff@jnic.org",
    }),
  },
];

export function findDemoAccount(email: string) {
  return demoAccounts.find((account) => account.email === email.trim().toLowerCase());
}

export const mockUser: Pastor = demoAccounts[0].user;
export const mockUserDefaultRole: Role = "HQ_ADMIN";
