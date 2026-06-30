import type { Pastor, Role, WalletAccount } from "@/lib/data/types";
import type { StaffMember } from "@/lib/data/types";
import { pastors } from "@/lib/data/seed";
import { findDemoAccount } from "@/lib/auth/mock-user";

function staffWalletId(id: string) {
  return `wal-staff-${id}`;
}

function pastorWalletId(id: string) {
  return `wal-pastor-${id}`;
}

function hqWalletId(id: string) {
  return `wal-hq-${id}`;
}

function pastorWalletForRole(user: Pastor, role: Role): string | null {
  if (role === "STATE_PASTOR") {
    const pastor = pastors.find((p) => p.stateId === user.stateId && p.rank === "State Pastor");
    return pastor ? pastorWalletId(pastor.id) : null;
  }
  if (role === "BRANCH_PASTOR" && user.branchId) {
    const pastor =
      pastors.find((p) => p.branchId === user.branchId && p.rank === "Senior Pastor") ??
      pastors.find((p) => p.branchId === user.branchId && p.rank === "Zonal Pastor");
    return pastor ? pastorWalletId(pastor.id) : null;
  }
  return null;
}

export function resolveWalletForUser(
  role: Role,
  user: Pastor,
  staffMembers: StaffMember[],
  walletAccounts: WalletAccount[],
): WalletAccount | null {
  const find = (id: string) => walletAccounts.find((w) => w.id === id) ?? null;
  const demoEmail = user.email.toLowerCase();

  if (role === "STAFF") {
    const staff = staffMembers.find((s) => s.email.toLowerCase() === demoEmail);
    if (staff) {
      const wid = staff.employmentType === "hq" ? hqWalletId(staff.id) : staffWalletId(staff.id);
      return find(wid);
    }
  }

  if (role === "HQ_ADMIN") {
    const hqStaff = staffMembers.find((s) => s.email.toLowerCase() === "admin@jnic.org");
    if (hqStaff) return find(hqWalletId(hqStaff.id));
  }

  if (role === "BRANCH_PASTOR" || role === "STATE_PASTOR") {
    const wid = pastorWalletForRole(user, role);
    if (wid) return find(wid);
  }

  if (findDemoAccount(demoEmail)) {
    const staff = staffMembers.find((s) => s.email.toLowerCase() === demoEmail);
    if (staff) {
      const wid = staff.employmentType === "hq" ? hqWalletId(staff.id) : staffWalletId(staff.id);
      return find(wid);
    }
  }

  return null;
}
