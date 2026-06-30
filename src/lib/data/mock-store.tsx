import * as React from "react";
import { toast } from "sonner";
import type {
  Transfer,
  LeaveRequest,
  BranchReport,
  AuditEvent,
  Notification,
  Task,
  WeeklyBranchReport,
  MonthlySummary,
  Branch,
  StaffMember,
  Announcement,
  Remittance,
  State,
  DocItem,
  DocFolder,
  WalletAccount,
  WalletTransaction,
  PayrollRun,
  PayrollLine,
  BankDetails,
  PayeeType,
} from "./types";
import type { RoleContext } from "./filters";
import { countPendingApprovals } from "./filters";
import {
  transfers as seedTransfers,
  leaveRequests as seedLeave,
  reports as seedReports,
  weeklyReports as seedWeeklyReports,
  monthlySummaries as seedMonthlySummaries,
  branches as seedBranches,
  states as seedStates,
  staffMembers as seedStaffMembers,
  auditFeed as seedAudit,
  notifications as seedNotifications,
  tasks as seedTasks,
  announcements as seedAnnouncements,
  remittances as seedRemittances,
  documents as seedDocuments,
  docFolders as seedDocFolders,
  pastors as seedPastors,
  pastorName,
  branchName,
  findBranch,
  findPastor,
  aggregateWeeklyForMonth,
  CURRENT_MONTH,
  orgWallet as seedOrgWallet,
  walletAccounts as seedWalletAccounts,
  walletTransactions as seedWalletTransactions,
  payrollRuns as seedPayrollRuns,
  ORG_WALLET_ID,
  walletOwnerName,
} from "./seed";
import { mockPaystackTransferRef, createMockPaystackDva } from "@/lib/wallet/paystack";
import { naira } from "@/lib/format";

interface WeeklyReportInput {
  attendance: WeeklyBranchReport["attendance"];
  salvations: number;
  baptisms: number;
  dedications: number;
  cellGroups: WeeklyBranchReport["cellGroups"];
  notes: string;
}

interface MockStoreValue {
  transfers: Transfer[];
  leaveRequests: LeaveRequest[];
  reports: BranchReport[];
  weeklyReports: WeeklyBranchReport[];
  monthlySummaries: MonthlySummary[];
  branches: Branch[];
  states: State[];
  staffMembers: StaffMember[];
  auditFeed: AuditEvent[];
  notifications: Notification[];
  tasks: Task[];
  announcements: Announcement[];
  remittances: Remittance[];
  docFolders: DocFolder[];
  documents: DocItem[];
  approveTransfer: (id: string, actorId: string) => void;
  rejectTransfer: (id: string, actorId: string) => void;
  approveLeave: (id: string, actorId: string) => void;
  rejectLeave: (id: string, actorId: string) => void;
  approveReport: (id: string, actorId: string) => void;
  submitReport: (branchId: string, actorId: string, period: string) => void;
  submitWeeklyReport: (branchId: string, actorId: string, weekEnding: string, data: WeeklyReportInput) => void;
  submitMonthlySummary: (branchId: string, actorId: string, period: string, offering: number, notes: string) => void;
  updateBranchContact: (branchId: string, updates: { phone?: string; address?: string }) => void;
  addBranch: (branch: Omit<Branch, "id">) => void;
  addState: (state: Omit<State, "id">) => void;
  addStaffMember: (staff: Omit<StaffMember, "id">) => void;
  updateStaffMember: (id: string, updates: Partial<Omit<StaffMember, "id">>) => void;
  removeStaffMember: (id: string) => void;
  updateTaskStatus: (id: string, status: Task["status"]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addAudit: (event: Omit<AuditEvent, "id">) => void;
  pendingApprovalsCount: (ctx: RoleContext) => number;
  initiateTransfer: (input: {
    pastorId: string;
    fromBranchId: string;
    toBranchId: string;
    effectiveDate: string;
    reason: string;
    requestedById: string;
  }) => void;
  publishAnnouncement: (input: {
    title: string;
    body: string;
    scopeId: string;
    senderId: string;
    senderRole: Announcement["senderRole"];
    priority: Announcement["priority"];
  }) => void;
  recordRemittance: (
    branchId: string,
    amount: number,
    reference: string,
    method: Remittance["method"],
    actorId: string,
  ) => void;
  createFolder: (input: { name: string; parentId: string }) => void;
  uploadDocument: (input: Omit<DocItem, "id" | "starred" | "trashedAt" | "lastAccessedAt" | "uploadedAt">) => void;
  starItem: (type: "folder" | "document", id: string, starred: boolean) => void;
  trashItem: (type: "folder" | "document", id: string) => void;
  restoreItem: (type: "folder" | "document", id: string) => void;
  deletePermanently: (type: "folder" | "document", id: string) => void;
  touchDocument: (id: string) => void;
  orgWallet: WalletAccount;
  walletAccounts: WalletAccount[];
  walletTransactions: WalletTransaction[];
  payrollRuns: PayrollRun[];
  topUpOrgWallet: (amount: number, reference: string, actorId: string) => void;
  createPayrollDraft: (fileName: string, period: string, lines: PayrollLine[], actorId: string) => string;
  processPayrollRun: (runId: string, actorId: string) => void;
  withdrawViaPaystack: (walletAccountId: string, amount: number, actorId: string) => void;
  updatePayoutBank: (walletAccountId: string, bank: BankDetails) => void;
}

const Ctx = React.createContext<MockStoreValue | null>(null);

let auditCounter = 100;
let staffCounter = 100;
let transferCounter = 100;
let announcementCounter = 100;
let branchCounter = 100;
let stateCounter = 100;
let docCounter = 100;
let folderCounter = 100;
let walletTxCounter = 100;
let payrollCounter = 100;

function walletIdForPayee(personType: PayeeType, personId: string): string {
  if (personType === "pastor") return `wal-pastor-${personId}`;
  if (personType === "hq") return `wal-hq-${personId}`;
  return `wal-staff-${personId}`;
}

function makeAudit(partial: Omit<AuditEvent, "id">): AuditEvent {
  auditCounter += 1;
  return { id: `a-live-${auditCounter}`, ...partial };
}

function makeNotification(partial: Omit<Notification, "id">): Notification {
  return { id: `n-live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ...partial };
}

export function MockStoreProvider({ children }: { children: React.ReactNode }) {
  const [transfers, setTransfers] = React.useState<Transfer[]>(() => [...seedTransfers]);
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>(() => [...seedLeave]);
  const [reports, setReports] = React.useState<BranchReport[]>(() => [...seedReports]);
  const [weeklyReports, setWeeklyReports] = React.useState<WeeklyBranchReport[]>(() => [...seedWeeklyReports]);
  const [monthlySummaries, setMonthlySummaries] = React.useState<MonthlySummary[]>(() => [...seedMonthlySummaries]);
  const [branches, setBranches] = React.useState<Branch[]>(() => [...seedBranches]);
  const [states, setStates] = React.useState<State[]>(() => [...seedStates]);
  const [staffMembers, setStaffMembers] = React.useState<StaffMember[]>(() => [...seedStaffMembers]);
  const [auditFeed, setAuditFeed] = React.useState<AuditEvent[]>(() => [...seedAudit]);
  const [notifications, setNotifications] = React.useState<Notification[]>(() => [...seedNotifications]);
  const [tasks, setTasks] = React.useState<Task[]>(() => [...seedTasks]);
  const [announcements, setAnnouncements] = React.useState<Announcement[]>(() => [...seedAnnouncements]);
  const [remittances, setRemittances] = React.useState<Remittance[]>(() => [...seedRemittances]);
  const [docFolders, setDocFolders] = React.useState<DocFolder[]>(() => [...seedDocFolders]);
  const [documents, setDocuments] = React.useState<DocItem[]>(() => [...seedDocuments]);
  const [walletAccounts, setWalletAccounts] = React.useState<WalletAccount[]>(() => [...seedWalletAccounts]);
  const [walletTransactions, setWalletTransactions] = React.useState<WalletTransaction[]>(() => [...seedWalletTransactions]);
  const [payrollRuns, setPayrollRuns] = React.useState<PayrollRun[]>(() => [...seedPayrollRuns]);

  const orgWallet = React.useMemo(
    () => walletAccounts.find((w) => w.id === ORG_WALLET_ID) ?? seedOrgWallet,
    [walletAccounts],
  );

  const addAudit = React.useCallback((event: Omit<AuditEvent, "id">) => {
    setAuditFeed((prev) => [makeAudit(event), ...prev]);
  }, []);

  const approveTransfer = React.useCallback(
    (id: string, actorId: string) => {
      const t = transfers.find((x) => x.id === id);
      if (!t || t.status !== "Pending") return;
      setTransfers((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Approved" as const } : x)));
      const msg = `Transfer approved — ${pastorName(t.pastorId)} to ${branchName(t.toBranchId)}`;
      addAudit({ icon: "transfer", description: msg, actorId, at: new Date().toISOString() });
      setNotifications((prev) => [
        makeNotification({ type: "transfer", message: msg, at: new Date().toISOString(), read: false, href: "/dashboard/transfers" }),
        ...prev,
      ]);
      toast.success(msg);
    },
    [transfers, addAudit],
  );

  const rejectTransfer = React.useCallback(
    (id: string, actorId: string) => {
      const t = transfers.find((x) => x.id === id);
      if (!t || t.status !== "Pending") return;
      setTransfers((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Rejected" as const } : x)));
      const msg = `Transfer rejected — ${pastorName(t.pastorId)}`;
      addAudit({ icon: "transfer", description: msg, actorId, at: new Date().toISOString() });
      toast.success(msg);
    },
    [transfers, addAudit],
  );

  const approveLeave = React.useCallback(
    (id: string, actorId: string) => {
      const l = leaveRequests.find((x) => x.id === id);
      if (!l || l.status !== "Pending") return;
      setLeaveRequests((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Approved" as const } : x)));
      const msg = `Leave approved for ${pastorName(l.pastorId)}`;
      addAudit({ icon: "leave", description: msg, actorId, at: new Date().toISOString() });
      toast.success(msg);
    },
    [leaveRequests, addAudit],
  );

  const rejectLeave = React.useCallback(
    (id: string, actorId: string) => {
      const l = leaveRequests.find((x) => x.id === id);
      if (!l || l.status !== "Pending") return;
      setLeaveRequests((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Rejected" as const } : x)));
      const msg = `Leave rejected for ${pastorName(l.pastorId)}`;
      addAudit({ icon: "leave", description: msg, actorId, at: new Date().toISOString() });
      toast.success(msg);
    },
    [leaveRequests, addAudit],
  );

  const approveReport = React.useCallback(
    (id: string, actorId: string) => {
      setReports((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: "Approved" as const } : x)),
      );
      const r = reports.find((x) => x.id === id);
      const msg = r ? `Report approved — ${branchName(r.branchId)}` : "Report approved";
      addAudit({ icon: "report", description: msg, actorId, at: new Date().toISOString() });
      toast.success(msg);
    },
    [reports, addAudit],
  );

  const submitReport = React.useCallback(
    (branchId: string, actorId: string, period: string) => {
      setReports((prev) =>
        prev.map((x) =>
          x.branchId === branchId && x.period === period
            ? { ...x, status: "Submitted" as const, submittedAt: new Date().toISOString(), submittedById: actorId }
            : x,
        ),
      );
      const msg = `Report submitted — ${branchName(branchId)} (${period})`;
      addAudit({ icon: "report", description: msg, actorId, at: new Date().toISOString() });
      toast.success(msg);
    },
    [addAudit],
  );

  const submitWeeklyReport = React.useCallback(
    (branchId: string, actorId: string, weekEnding: string, data: WeeklyReportInput) => {
      setWeeklyReports((prev) => {
        const updated = prev.map((x) =>
          x.branchId === branchId && x.weekEnding === weekEnding
            ? {
                ...x,
                ...data,
                status: "Submitted" as const,
                submittedAt: new Date().toISOString(),
                submittedById: actorId,
              }
            : x,
        );
        setMonthlySummaries((summaries) =>
          summaries.map((m) => {
            if (m.branchId !== branchId || m.period !== CURRENT_MONTH) return m;
            const { totals, weeksSubmitted } = aggregateWeeklyForMonth(branchId, CURRENT_MONTH, updated);
            return { ...m, totals, weeksSubmitted };
          }),
        );
        return updated;
      });
      const msg = `Weekly report submitted — ${branchName(branchId)} (week ending ${weekEnding})`;
      addAudit({ icon: "report", description: msg, actorId, at: new Date().toISOString() });
      toast.success(msg);
    },
    [addAudit],
  );

  const submitMonthlySummary = React.useCallback(
    (branchId: string, actorId: string, period: string, offering: number, notes: string) => {
      setMonthlySummaries((prev) =>
        prev.map((m) => {
          if (m.branchId !== branchId || m.period !== period) return m;
          return {
            ...m,
            offering,
            notes,
            status: "Submitted" as const,
            submittedAt: new Date().toISOString(),
            submittedById: actorId,
          };
        }),
      );
      setWeeklyReports((weeks) => {
        const { totals, weeksSubmitted } = aggregateWeeklyForMonth(branchId, period, weeks);
        setMonthlySummaries((prev) =>
          prev.map((m) => {
            if (m.branchId !== branchId || m.period !== period) return m;
            return { ...m, totals, weeksSubmitted };
          }),
        );
        return weeks;
      });
      const msg = `Monthly summary submitted — ${branchName(branchId)} (${period})`;
      addAudit({ icon: "report", description: msg, actorId, at: new Date().toISOString() });
      toast.success(msg);
    },
    [addAudit],
  );

  const updateBranchContact = React.useCallback(
    (branchId: string, updates: { phone?: string; address?: string }) => {
      setBranches((prev) =>
        prev.map((b) => (b.id === branchId ? { ...b, ...updates } : b)),
      );
      toast.success("Branch contact details updated");
    },
    [],
  );

  const addBranch = React.useCallback((branch: Omit<Branch, "id">) => {
    branchCounter += 1;
    const id = `br-live-${branchCounter}`;
    setBranches((prev) => [...prev, { ...branch, id }]);
    addAudit({
      icon: "report",
      description: `Branch added — ${branch.name}`,
      actorId: "p-001",
      at: new Date().toISOString(),
    });
    toast.success(`${branch.name} added`);
  }, [addAudit]);

  const addState = React.useCallback((state: Omit<State, "id">) => {
    stateCounter += 1;
    const id = `st-live-${stateCounter}`;
    setStates((prev) => [...prev, { ...state, id }]);
    addAudit({
      icon: "report",
      description: `State added — ${state.name}`,
      actorId: "p-001",
      at: new Date().toISOString(),
    });
    toast.success(`${state.name} State added`);
  }, [addAudit]);

  const addStaffMember = React.useCallback((staff: Omit<StaffMember, "id">) => {
    staffCounter += 1;
    const id = `stf-live-${staffCounter}`;
    setStaffMembers((prev) => [...prev, { ...staff, id }]);
    toast.success(`${staff.name} added to staff`);
  }, []);

  const updateStaffMember = React.useCallback((id: string, updates: Partial<Omit<StaffMember, "id">>) => {
    setStaffMembers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    toast.success("Staff member updated");
  }, []);

  const removeStaffMember = React.useCallback((id: string) => {
    setStaffMembers((prev) => prev.filter((s) => s.id !== id));
    toast.success("Staff member removed");
  }, []);

  const updateTaskStatus = React.useCallback((id: string, status: Task["status"]) => {
    setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success(`Task marked as ${status}`);
  }, []);

  const markNotificationRead = React.useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = React.useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const pendingApprovalsCount = React.useCallback(
    (ctx: RoleContext) =>
      countPendingApprovals(ctx, {
        transfers,
        leaveRequests,
        reports,
        branches,
        getBranchState: (bid) => findBranch(bid)?.stateId,
        getPastorState: (pid) => findPastor(pid)?.stateId,
      }),
    [transfers, leaveRequests, reports, branches],
  );

  const initiateTransfer = React.useCallback(
    (input: {
      pastorId: string;
      fromBranchId: string;
      toBranchId: string;
      effectiveDate: string;
      reason: string;
      requestedById: string;
    }) => {
      transferCounter += 1;
      const transfer: Transfer = {
        id: `tr-live-${transferCounter}`,
        pastorId: input.pastorId,
        fromBranchId: input.fromBranchId,
        toBranchId: input.toBranchId,
        requestedById: input.requestedById,
        requestedAt: new Date().toISOString(),
        effectiveDate: input.effectiveDate,
        reason: input.reason,
        status: "Pending",
      };
      setTransfers((prev) => [transfer, ...prev]);
      const msg = `Transfer initiated — ${pastorName(input.pastorId)} to ${branchName(input.toBranchId)}`;
      addAudit({ icon: "transfer", description: msg, actorId: input.requestedById, at: new Date().toISOString() });
      toast.success(msg);
    },
    [addAudit],
  );

  const publishAnnouncement = React.useCallback(
    (input: {
      title: string;
      body: string;
      scopeId: string;
      senderId: string;
      senderRole: Announcement["senderRole"];
      priority: Announcement["priority"];
    }) => {
      announcementCounter += 1;
      const recipientCount = seedPastors.filter((p) => p.stateId === input.scopeId).length;
      const announcement: Announcement = {
        id: `an-live-${announcementCounter}`,
        title: input.title,
        body: input.body,
        scope: "State",
        scopeId: input.scopeId,
        senderId: input.senderId,
        senderRole: input.senderRole,
        priority: input.priority,
        publishedAt: new Date().toISOString(),
        readBy: [],
        recipientCount,
      };
      setAnnouncements((prev) => [announcement, ...prev]);
      toast.success("Announcement published to your state");
    },
    [],
  );

  const recordRemittance = React.useCallback(
    (branchId: string, amount: number, reference: string, method: Remittance["method"], actorId: string) => {
      setRemittances((prev) =>
        prev.map((r) => {
          if (r.branchId !== branchId || r.period !== "Apr 2025") return r;
          const received = r.received + amount;
          const status: Remittance["status"] =
            received >= r.expected ? "Compliant" : received > 0 ? "Partial" : "Outstanding";
          return {
            ...r,
            received,
            reference,
            method,
            paidAt: new Date().toISOString().slice(0, 10),
            status,
          };
        }),
      );
      const msg = `Remittance recorded — ${branchName(branchId)} (${naira(amount)})`;
      addAudit({ icon: "report", description: msg, actorId, at: new Date().toISOString() });
      toast.success(msg);
    },
    [addAudit],
  );

  const createFolder = React.useCallback((input: { name: string; parentId: string }) => {
    folderCounter += 1;
    const now = new Date().toISOString().slice(0, 10);
    const folder: DocFolder = {
      id: `fld-live-${folderCounter}`,
      name: input.name,
      parentId: input.parentId,
      starred: false,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    setDocFolders((prev) => [...prev, folder]);
    toast.success(`Folder "${input.name}" created`);
  }, []);

  const uploadDocument = React.useCallback(
    (input: Omit<DocItem, "id" | "starred" | "trashedAt" | "lastAccessedAt" | "uploadedAt">) => {
      docCounter += 1;
      const doc: DocItem = {
        ...input,
        id: `doc-live-${docCounter}`,
        uploadedAt: new Date().toISOString().slice(0, 10),
        starred: false,
        trashedAt: null,
        lastAccessedAt: null,
      };
      setDocuments((prev) => [...prev, doc]);
      toast.success(`"${input.name}" uploaded`);
    },
    [],
  );

  const starItem = React.useCallback((type: "folder" | "document", id: string, starred: boolean) => {
    if (type === "folder") {
      setDocFolders((prev) => prev.map((f) => (f.id === id ? { ...f, starred } : f)));
    } else {
      setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, starred } : d)));
    }
    toast.success(starred ? "Added to starred" : "Removed from starred");
  }, []);

  const trashItem = React.useCallback((type: "folder" | "document", id: string) => {
    const now = new Date().toISOString();
    if (type === "folder") {
      setDocFolders((prev) => prev.map((f) => (f.id === id ? { ...f, trashedAt: now } : f)));
    } else {
      setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, trashedAt: now } : d)));
    }
    toast.success("Moved to trash");
  }, []);

  const restoreItem = React.useCallback((type: "folder" | "document", id: string) => {
    if (type === "folder") {
      setDocFolders((prev) => prev.map((f) => (f.id === id ? { ...f, trashedAt: null } : f)));
    } else {
      setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, trashedAt: null } : d)));
    }
    toast.success("Restored from trash");
  }, []);

  const deletePermanently = React.useCallback((type: "folder" | "document", id: string) => {
    if (type === "folder") {
      setDocFolders((prev) => prev.filter((f) => f.id !== id));
    } else {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
    toast.success("Permanently deleted");
  }, []);

  const touchDocument = React.useCallback((id: string) => {
    const now = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, lastAccessedAt: now } : d)),
    );
  }, []);

  const topUpOrgWallet = React.useCallback(
    (amount: number, reference: string, actorId: string) => {
      if (amount <= 0) return;
      const now = new Date().toISOString();
      let newBalance = 0;
      setWalletAccounts((prev) => {
        const org = prev.find((w) => w.id === ORG_WALLET_ID);
        if (!org) return prev;
        newBalance = org.balance + amount;
        return prev.map((w) => (w.id === ORG_WALLET_ID ? { ...w, balance: newBalance } : w));
      });
      walletTxCounter += 1;
      const tx: WalletTransaction = {
        id: `wtx-live-${walletTxCounter}`,
        walletAccountId: ORG_WALLET_ID,
        type: "top_up",
        amount,
        balanceAfter: newBalance,
        reference,
        description: "HQ wallet top-up",
        actorId,
        at: now,
        status: "Completed",
      };
      setWalletTransactions((txs) => [tx, ...txs]);
      const msg = `HQ wallet topped up — ${naira(amount)}`;
      addAudit({ icon: "wallet", description: msg, actorId, at: now });
      toast.success(msg);
    },
    [addAudit],
  );

  const createPayrollDraft = React.useCallback(
    (fileName: string, period: string, lines: PayrollLine[], actorId: string): string => {
      payrollCounter += 1;
      const id = `pr-live-${payrollCounter}`;
      const totalAmount = lines.reduce((s, l) => s + l.amount, 0);
      const run: PayrollRun = {
        id,
        period,
        fileName,
        uploadedById: actorId,
        uploadedAt: new Date().toISOString(),
        totalAmount,
        lineCount: lines.length,
        status: "Draft",
        lines,
      };
      setPayrollRuns((prev) => [run, ...prev]);
      return id;
    },
    [],
  );

  const processPayrollRun = React.useCallback(
    (runId: string, actorId: string) => {
      const run = payrollRuns.find((r) => r.id === runId);
      if (!run || run.status !== "Draft") return;

      const validLines = run.lines.filter((l) => !l.error && l.amount > 0);
      const total = validLines.reduce((s, l) => s + l.amount, 0);
      const org = walletAccounts.find((w) => w.id === ORG_WALLET_ID);
      if (!org || org.balance < total) {
        toast.error("Insufficient HQ wallet balance for this payroll run");
        return;
      }

      const now = new Date().toISOString();
      const reference = `PAY-${run.period.replace(/\s+/g, "-").toUpperCase()}`;
      const balanceMap = new Map<string, number>();
      for (const w of walletAccounts) balanceMap.set(w.id, w.balance);

      const orgBal = balanceMap.get(ORG_WALLET_ID) ?? 0;
      const newOrgBalance = orgBal - total;
      balanceMap.set(ORG_WALLET_ID, newOrgBalance);

      for (const line of validLines) {
        const wid = walletIdForPayee(line.personType, line.personId);
        balanceMap.set(wid, (balanceMap.get(wid) ?? 0) + line.amount);
      }

      setWalletAccounts((prev) => {
        const existingIds = new Set(prev.map((w) => w.id));
        const updated = prev.map((w) => {
          const bal = balanceMap.get(w.id);
          return bal !== undefined ? { ...w, balance: bal } : w;
        });
        for (const line of validLines) {
          const wid = walletIdForPayee(line.personType, line.personId);
          if (!existingIds.has(wid)) {
            updated.push({
              id: wid,
              ownerType: line.personType,
              ownerId: line.personId,
              balance: balanceMap.get(wid) ?? line.amount,
              paystackDva: createMockPaystackDva(line.name, line.personId),
            });
          }
        }
        return updated;
      });

      walletTxCounter += 1;
      const orgTx: WalletTransaction = {
        id: `wtx-live-${walletTxCounter}`,
        walletAccountId: ORG_WALLET_ID,
        type: "payroll_debit",
        amount: total,
        balanceAfter: newOrgBalance,
        reference,
        description: `${run.period} payroll disbursement`,
        payrollRunId: runId,
        actorId,
        at: now,
        status: "Completed",
      };

      const creditTxs: WalletTransaction[] = validLines.map((line) => {
        walletTxCounter += 1;
        const wid = walletIdForPayee(line.personType, line.personId);
        return {
          id: `wtx-live-${walletTxCounter}`,
          walletAccountId: wid,
          type: "salary_credit" as const,
          amount: line.amount,
          balanceAfter: balanceMap.get(wid) ?? line.amount,
          reference,
          description: `${run.period} salary`,
          payrollRunId: runId,
          actorId,
          at: now,
          status: "Completed" as const,
        };
      });

      setWalletTransactions((prev) => [orgTx, ...creditTxs, ...prev]);

      const updatedLines = run.lines.map((line) => {
        if (line.error) return { ...line, status: "failed" as const };
        if (line.amount <= 0) return { ...line, status: "failed" as const, error: "Invalid amount" };
        return { ...line, status: "paid" as const };
      });
      const paidCount = updatedLines.filter((l) => l.status === "paid").length;
      const status: PayrollRun["status"] =
        paidCount === updatedLines.length ? "Completed" : paidCount > 0 ? "Partial" : "Failed";

      setPayrollRuns((prev) =>
        prev.map((r) =>
          r.id === runId ? { ...r, status, lines: updatedLines } : r,
        ),
      );

      const msg = `Payroll processed — ${run.period} (${naira(total)}, ${paidCount} recipients)`;
      addAudit({ icon: "wallet", description: msg, actorId, at: now });
      toast.success(msg);
    },
    [payrollRuns, walletAccounts, addAudit],
  );

  const withdrawViaPaystack = React.useCallback(
    (walletAccountId: string, amount: number, actorId: string) => {
      const account = walletAccounts.find((w) => w.id === walletAccountId);
      if (!account || account.ownerType === "org") return;
      if (!account.payoutBank) {
        toast.error("Link a payout bank account before withdrawing");
        return;
      }
      if (amount <= 0 || amount > account.balance) {
        toast.error("Insufficient wallet balance");
        return;
      }

      const now = new Date().toISOString();
      const reference = mockPaystackTransferRef();
      const newBalance = account.balance - amount;

      setWalletAccounts((prev) =>
        prev.map((w) => (w.id === walletAccountId ? { ...w, balance: newBalance } : w)),
      );

      walletTxCounter += 1;
      const tx: WalletTransaction = {
        id: `wtx-live-${walletTxCounter}`,
        walletAccountId,
        type: "withdrawal",
        amount,
        balanceAfter: newBalance,
        reference,
        description: `Paystack transfer to ${account.payoutBank.bankName}`,
        actorId,
        at: now,
        status: "Completed",
      };
      setWalletTransactions((prev) => [tx, ...prev]);

      const name = walletOwnerName(account);
      const msg = `Paystack transfer sent — ${name} (${naira(amount)})`;
      addAudit({ icon: "wallet", description: msg, actorId, at: now });
      toast.success("Transfer sent to your bank via Paystack");
    },
    [walletAccounts, addAudit],
  );

  const updatePayoutBank = React.useCallback((walletAccountId: string, bank: BankDetails) => {
    setWalletAccounts((prev) =>
      prev.map((w) => (w.id === walletAccountId ? { ...w, payoutBank: bank } : w)),
    );
    toast.success("Payout bank account updated");
  }, []);

  const value: MockStoreValue = {
    transfers,
    leaveRequests,
    reports,
    weeklyReports,
    monthlySummaries,
    branches,
    states,
    staffMembers,
    auditFeed,
    notifications,
    tasks,
    announcements,
    remittances,
    docFolders,
    documents,
    approveTransfer,
    rejectTransfer,
    approveLeave,
    rejectLeave,
    approveReport,
    submitReport,
    submitWeeklyReport,
    submitMonthlySummary,
    updateBranchContact,
    addBranch,
    addState,
    addStaffMember,
    updateStaffMember,
    removeStaffMember,
    updateTaskStatus,
    markNotificationRead,
    markAllNotificationsRead,
    addAudit,
    pendingApprovalsCount,
    initiateTransfer,
    publishAnnouncement,
    recordRemittance,
    createFolder,
    uploadDocument,
    starItem,
    trashItem,
    restoreItem,
    deletePermanently,
    touchDocument,
    orgWallet,
    walletAccounts,
    walletTransactions,
    payrollRuns,
    topUpOrgWallet,
    createPayrollDraft,
    processPayrollRun,
    withdrawViaPaystack,
    updatePayoutBank,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMockStore() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useMockStore must be used inside MockStoreProvider");
  return v;
}
