import type {
  Role,
  Pastor,
  Branch,
  Announcement,
  DocItem,
  DocFolder,
  JNEvent,
  Transfer,
  LeaveRequest,
  BranchReport,
  Remittance,
  Task,
  InboxMessage,
  WeeklyBranchReport,
  MonthlySummary,
  WalletTransaction,
} from "./types";

export interface RoleContext {
  role: Role;
  user: Pastor;
}

export function filterBranches(ctx: RoleContext, items: Branch[]): Branch[] {
  const { role, user } = ctx;
  if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return items;
  if (role === "STATE_PASTOR") return items.filter((b) => b.stateId === user.stateId);
  if (role === "BRANCH_PASTOR" || role === "STAFF") {
    if (!user.branchId) return [];
    return items.filter((b) => b.id === user.branchId);
  }
  return items;
}

export function filterPastors(ctx: RoleContext, items: Pastor[]): Pastor[] {
  const { role, user } = ctx;
  if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return items;
  if (role === "STATE_PASTOR") return items.filter((p) => p.stateId === user.stateId);
  if (role === "BRANCH_PASTOR") return items.filter((p) => p.branchId === user.branchId);
  return [];
}

export function filterAnnouncements(ctx: RoleContext, items: Announcement[]): Announcement[] {
  const { role, user } = ctx;
  return items.filter((a) => {
    if (a.scope === "All") return true;
    if (a.scope === "State" && a.scopeId === user.stateId) return true;
    if (a.scope === "Branch" && a.scopeId === user.branchId) return true;
    if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return true;
    return false;
  });
}

function canSeeDocument(role: Role, d: DocItem): boolean {
  if (d.visibility === "All") return true;
  if (d.visibility === "HQ Only") return role === "HQ_ADMIN" || role === "GENERAL_OVERSEER";
  if (d.visibility === "State Pastors and above") {
    return role !== "BRANCH_PASTOR" && role !== "STAFF";
  }
  return true;
}

export function filterDocuments(
  ctx: RoleContext,
  items: DocItem[],
  options?: { includeTrashed?: boolean },
): DocItem[] {
  const { role } = ctx;
  return items.filter((d) => {
    if (!options?.includeTrashed && d.trashedAt) return false;
    if (options?.includeTrashed && !d.trashedAt) return false;
    return canSeeDocument(role, d);
  });
}

export function filterDocFolders(
  ctx: RoleContext,
  folders: DocFolder[],
  documents: DocItem[],
  options?: { includeTrashed?: boolean },
): DocFolder[] {
  const { role } = ctx;
  const visibleDocs = filterDocuments(ctx, documents, options);

  const folderHasVisibleContent = (folderId: string): boolean => {
    if (visibleDocs.some((d) => d.folderId === folderId)) return true;
    return folders.some((f) => f.parentId === folderId && folderHasVisibleContent(f.id));
  };

  return folders.filter((f) => {
    if (!options?.includeTrashed && f.trashedAt) return false;
    if (options?.includeTrashed && !f.trashedAt) return false;
    if (f.parentId === null) return folderHasVisibleContent(f.id);
    return folderHasVisibleContent(f.id);
  });
}

export function filterEvents(ctx: RoleContext, items: JNEvent[]): JNEvent[] {
  const { role, user } = ctx;
  if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return items;
  return items.filter((e) => {
    if (e.scope === "Org-Wide") return true;
    if (e.scope === "State" && e.scopeIds.includes(user.stateId)) return true;
    if (e.scope === "Branch" && user.branchId && e.scopeIds.includes(user.branchId)) return true;
    return false;
  });
}

export function filterTransfersByState(
  ctx: RoleContext,
  items: Transfer[],
  getBranchState: (branchId: string) => string | undefined,
): Transfer[] {
  const { role, user } = ctx;
  if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return items;
  if (role === "STATE_PASTOR") {
    return items.filter(
      (t) =>
        getBranchState(t.fromBranchId) === user.stateId ||
        getBranchState(t.toBranchId) === user.stateId,
    );
  }
  return [];
}

export function filterLeaveByState(
  ctx: RoleContext,
  items: LeaveRequest[],
  getPastorState: (pastorId: string) => string | undefined,
): LeaveRequest[] {
  const { role, user } = ctx;
  if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return items;
  if (role === "STATE_PASTOR") {
    return items.filter((l) => getPastorState(l.pastorId) === user.stateId);
  }
  if (role === "BRANCH_PASTOR") return items.filter((l) => l.pastorId === user.id);
  return [];
}

export function filterReports(ctx: RoleContext, items: BranchReport[], branches: Branch[]): BranchReport[] {
  const { role, user } = ctx;
  if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return items;
  if (role === "STATE_PASTOR") {
    const stateBranchIds = new Set(branches.filter((b) => b.stateId === user.stateId).map((b) => b.id));
    return items.filter((r) => stateBranchIds.has(r.branchId));
  }
  if (role === "BRANCH_PASTOR" && user.branchId) {
    return items.filter((r) => r.branchId === user.branchId);
  }
  return [];
}

export function filterWeeklyReports(ctx: RoleContext, items: WeeklyBranchReport[], branches: Branch[]): WeeklyBranchReport[] {
  const { role, user } = ctx;
  if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return items;
  if (role === "STATE_PASTOR") {
    const stateBranchIds = new Set(branches.filter((b) => b.stateId === user.stateId).map((b) => b.id));
    return items.filter((r) => stateBranchIds.has(r.branchId));
  }
  if (role === "BRANCH_PASTOR" && user.branchId) {
    return items.filter((r) => r.branchId === user.branchId);
  }
  return [];
}

export function filterMonthlySummaries(ctx: RoleContext, items: MonthlySummary[], branches: Branch[]): MonthlySummary[] {
  const { role, user } = ctx;
  if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return items;
  if (role === "STATE_PASTOR") {
    const stateBranchIds = new Set(branches.filter((b) => b.stateId === user.stateId).map((b) => b.id));
    return items.filter((m) => stateBranchIds.has(m.branchId));
  }
  if (role === "BRANCH_PASTOR" && user.branchId) {
    return items.filter((m) => m.branchId === user.branchId);
  }
  return [];
}

export function filterRemittances(ctx: RoleContext, items: Remittance[], branches: Branch[]): Remittance[] {
  const { role, user } = ctx;
  if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return items;
  if (role === "STATE_PASTOR") {
    const stateBranchIds = new Set(branches.filter((b) => b.stateId === user.stateId).map((b) => b.id));
    return items.filter((r) => stateBranchIds.has(r.branchId));
  }
  return [];
}

export function filterTasks(ctx: RoleContext, items: Task[]): Task[] {
  const { role, user } = ctx;
  if (role === "HQ_ADMIN" || role === "GENERAL_OVERSEER") return items;
  if (role === "STATE_PASTOR") {
    return items.filter(
      (t) =>
        t.assigneeId === user.id ||
        t.scope === "State" && t.scopeId === user.stateId ||
        t.scope === "Org-Wide",
    );
  }
  if (role === "BRANCH_PASTOR" || role === "STAFF") {
    return items.filter(
      (t) =>
        t.assigneeId === user.id ||
        (t.scope === "Branch" && t.scopeId === user.branchId),
    );
  }
  return items.filter((t) => t.assigneeId === user.id);
}

export function filterInbox(ctx: RoleContext, items: InboxMessage[]): InboxMessage[] {
  const { role, user } = ctx;
  return items.filter(
    (m) =>
      m.toId === user.id ||
      m.toRole === role ||
      (m.toRole === "ALL" && true),
  );
}

export interface PendingApprovalsInput {
  transfers: Transfer[];
  leaveRequests: LeaveRequest[];
  reports: BranchReport[];
  branches: Branch[];
  period?: string;
  getBranchState: (branchId: string) => string | undefined;
  getPastorState: (pastorId: string) => string | undefined;
}

export function countPendingApprovals(
  ctx: RoleContext,
  input: PendingApprovalsInput,
): number {
  const period = input.period ?? "Apr 2025";

  const pendingTransfers = filterTransfersByState(
    ctx,
    input.transfers.filter((t) => t.status === "Pending"),
    input.getBranchState,
  ).length;

  const pendingLeave = filterLeaveByState(
    ctx,
    input.leaveRequests.filter((l) => l.status === "Pending"),
    input.getPastorState,
  ).length;

  const pendingReports = filterReports(
    ctx,
    input.reports.filter(
      (r) => r.period === period && (r.status === "Pending" || r.status === "Overdue"),
    ),
    input.branches,
  ).length;

  return pendingTransfers + pendingLeave + pendingReports;
}

export function filterWalletTransactionsForAccount(
  transactions: WalletTransaction[],
  walletAccountId: string,
): WalletTransaction[] {
  return transactions.filter((t) => t.walletAccountId === walletAccountId);
}

export function filterOrgWalletTransactions(transactions: WalletTransaction[], orgWalletId: string): WalletTransaction[] {
  return transactions.filter((t) => t.walletAccountId === orgWalletId);
}
