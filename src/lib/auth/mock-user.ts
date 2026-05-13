import type { Pastor, Role } from "@/lib/data/types";
import { pastors } from "@/lib/data/seed";

// Mock current user for development; the role switcher will override the active role.
export const mockUser: Pastor = pastors[0]; // first State Pastor — Rivers
export const mockUserDefaultRole: Role = "HQ_ADMIN";
