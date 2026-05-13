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

export interface DocItem {
  id: string;
  name: string;
  category: "Policy" | "Constitution" | "Circular" | "Form" | "Certificate";
  uploadedById: string;
  uploadedAt: string;
  sizeKb: number;
  visibility: "All" | "HQ Only" | "State Pastors and above";
  description: string;
}

export interface AuditEvent {
  id: string;
  icon: "transfer" | "report" | "leave" | "remit" | "announcement" | "event" | "branch";
  description: string;
  actorId: string;
  at: string;
}

export interface Notification {
  id: string;
  type: "transfer" | "report" | "announcement" | "leave" | "remittance";
  message: string;
  at: string;
  read: boolean;
  href: string;
}
