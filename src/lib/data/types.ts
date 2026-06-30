// JNLOP types
export type Role =
  | "GENERAL_OVERSEER"
  | "HQ_ADMIN"
  | "STATE_PASTOR"
  | "BRANCH_PASTOR"
  | "STAFF";

export type PastoralRank =
  | "Deacon"
  | "Pastor"
  | "Senior Pastor"
  | "Zonal Pastor"
  | "State Pastor";

export type PastorStatus = "Active" | "On Leave" | "Transferred";

export interface State {
  id: string;
  name: string;
  pastorId: string; // state pastor
}

export interface District {
  id: string;
  name: string;
  stateId: string;
}

export interface Branch {
  id: string;
  name: string;
  stateId: string;
  districtId: string;
  address: string;
  foundedYear: number;
  seniorPastorId: string;
  phone: string;
  status: "Active" | "Inactive";
}

export interface Pastor {
  id: string;
  firstName: string;
  lastName: string;
  rank: PastoralRank;
  status: PastorStatus;
  branchId: string | null;
  stateId: string;
  email: string;
  phone: string;
  ordainedAt: string; // ISO date
  qualifications: string;
  emergencyContact: string;
}

export interface Transfer {
  id: string;
  pastorId: string;
  fromBranchId: string;
  toBranchId: string;
  requestedById: string;
  requestedAt: string;
  effectiveDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface BranchReport {
  id: string;
  branchId: string;
  period: string; // "Oct 2024"
  submittedById: string;
  submittedAt: string | null;
  attendance: { adults: number; youth: number; children: number };
  salvations: number;
  baptisms: number;
  dedications: number;
  cellGroups: { count: number; attendance: number };
  offering: number; // naira
  notes: string;
  status: "Submitted" | "Pending" | "Overdue" | "Approved";
}

export interface WeeklyBranchReport {
  id: string;
  branchId: string;
  weekEnding: string; // ISO date (Sunday)
  month: string; // "May 2025"
  submittedById: string;
  submittedAt: string | null;
  attendance: { adults: number; youth: number; children: number };
  salvations: number;
  baptisms: number;
  dedications: number;
  cellGroups: { count: number; attendance: number };
  notes: string;
  status: "Submitted" | "Pending" | "Overdue";
}

export interface MonthlySummary {
  id: string;
  branchId: string;
  period: string; // "May 2025"
  submittedById: string;
  submittedAt: string | null;
  offering: number;
  notes: string;
  status: "Submitted" | "Pending" | "Overdue" | "Approved";
  totals: {
    attendance: { adults: number; youth: number; children: number };
    salvations: number;
    baptisms: number;
    dedications: number;
  };
  weeksSubmitted: number;
  weeksExpected: number;
}

export interface Remittance {
  id: string;
  branchId: string;
  period: string;
  expected: number;
  received: number;
  reference: string;
  paidAt: string | null;
  method: "Bank Transfer" | "Cash";
  status: "Compliant" | "Partial" | "Outstanding";
}

export interface LeaveRequest {
  id: string;
  pastorId: string;
  type: "Annual" | "Medical" | "Compassionate" | "Sabbatical";
  fromDate: string;
  toDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedAt: string;
}

export interface JNEvent {
  id: string;
  name: string;
  type: "Convention" | "Retreat" | "Crusade" | "Training" | "Service";
  scope: "Org-Wide" | "State" | "Branch";
  scopeIds: string[]; // state or branch ids
  startDate: string;
  endDate: string;
  location: string;
  organiser: string;
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  scope: "All" | "State" | "Branch";
  scopeId: string | null;
  senderId: string;
  senderRole: Role;
  priority: "Normal" | "Urgent";
  publishedAt: string;
  readBy: string[]; // pastor ids
  recipientCount: number;
}

export interface DocFolder {
  id: string;
  name: string;
  parentId: string | null;
  starred: boolean;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocItem {
  id: string;
  name: string;
  folderId: string;
  category: "Policy" | "Constitution" | "Circular" | "Form" | "Certificate";
  uploadedById: string;
  uploadedAt: string;
  sizeKb: number;
  visibility: "All" | "HQ Only" | "State Pastors and above";
  description: string;
  starred: boolean;
  trashedAt: string | null;
  lastAccessedAt: string | null;
}

export interface AuditEvent {
  id: string;
  icon: "transfer" | "report" | "leave" | "remit" | "announcement" | "event" | "branch" | "wallet";
  description: string;
  actorId: string;
  at: string;
}

export interface Notification {
  id: string;
  type: "transfer" | "report" | "announcement" | "leave" | "remittance" | "task" | "inbox";
  message: string;
  at: string;
  read: boolean;
  href: string;
}

export type TaskStatus = "Todo" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assignerId: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  scope: "Org-Wide" | "State" | "Branch";
  scopeId: string | null;
}

export interface InboxMessage {
  id: string;
  subject: string;
  body: string;
  fromId: string;
  toId: string | null;
  toRole: Role | "ALL";
  read: boolean;
  at: string;
}

export interface ServiceSegment {
  id: string;
  title: string;
  duration: number;
  assignee: string;
}

export interface ServicePlan {
  id: string;
  branchId: string;
  date: string;
  theme: string;
  segments: ServiceSegment[];
  notes: string;
}

export interface ComplianceSnapshot {
  branchId: string;
  period: string;
  reportDue: string;
  reportStatus: BranchReport["status"];
  remitDue: string;
  remitStatus: Remittance["status"];
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  branchId: string;
  stateId: string;
  phone: string;
  email: string;
  employmentType: "branch" | "hq";
  monthlySalary: number;
}

export type PayeeType = "staff" | "pastor" | "hq";

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface PaystackDva {
  accountNumber: string;
  bankName: string;
  accountName: string;
  customerCode: string;
  dvaId: string;
}

export interface WalletAccount {
  id: string;
  ownerType: "org" | PayeeType;
  ownerId: string;
  balance: number;
  /** Paystack Dedicated Virtual Account for receiving salary credits */
  paystackDva?: PaystackDva;
  /** Linked bank account for instant Paystack transfers */
  payoutBank?: BankDetails;
}

export type WalletTransactionType = "top_up" | "salary_credit" | "withdrawal" | "payroll_debit";

export interface WalletTransaction {
  id: string;
  walletAccountId: string;
  type: WalletTransactionType;
  amount: number;
  balanceAfter: number;
  reference: string;
  description: string;
  payrollRunId?: string;
  actorId: string;
  at: string;
  status: "Completed" | "Pending" | "Failed";
}

export type PayrollLineStatus = "pending" | "paid" | "failed";

export interface PayrollLine {
  personType: PayeeType;
  personId: string;
  name: string;
  amount: number;
  status: PayrollLineStatus;
  error?: string;
}

export type PayrollRunStatus = "Draft" | "Processing" | "Completed" | "Partial" | "Failed";

export interface PayrollRun {
  id: string;
  period: string;
  fileName: string;
  uploadedById: string;
  uploadedAt: string;
  totalAmount: number;
  lineCount: number;
  status: PayrollRunStatus;
  lines: PayrollLine[];
}
