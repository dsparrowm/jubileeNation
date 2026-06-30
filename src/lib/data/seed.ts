import type {
  State, District, Branch, Pastor, Transfer, BranchReport, Remittance,
  LeaveRequest, JNEvent, Announcement, DocItem, DocFolder, AuditEvent, Notification, PastoralRank,
  Task, InboxMessage, ServicePlan, ComplianceSnapshot, StaffMember,
  WeeklyBranchReport, MonthlySummary,
  WalletAccount, WalletTransaction, PayrollRun, PayeeType,
} from "./types";
import { createMockPaystackDva } from "@/lib/wallet/paystack";

/* --------------------------------- STATES --------------------------------- */
export const states: State[] = [
  { id: "st-rivers", name: "Rivers", pastorId: "p-001" },
  { id: "st-cross-river", name: "Cross River", pastorId: "p-002" },
  { id: "st-akwa-ibom", name: "Akwa Ibom", pastorId: "p-003" },
  { id: "st-lagos", name: "Lagos", pastorId: "p-004" },
  { id: "st-fct", name: "FCT", pastorId: "p-005" },
  { id: "st-enugu", name: "Enugu", pastorId: "p-006" },
  { id: "st-anambra", name: "Anambra", pastorId: "p-007" },
  { id: "st-delta", name: "Delta", pastorId: "p-008" },
  { id: "st-edo", name: "Edo", pastorId: "p-009" },
];

/* -------------------------------- DISTRICTS ------------------------------- */
export const districts: District[] = states.flatMap((s, i) => [
  { id: `${s.id}-d1`, name: `${s.name} District I`, stateId: s.id },
  { id: `${s.id}-d2`, name: `${s.name} District II`, stateId: s.id },
]);

/* --------------------------------- BRANCHES ------------------------------- */
const branchSeeds: { stateId: string; names: string[] }[] = [
  { stateId: "st-rivers", names: ["Port Harcourt Central", "Eleme Main", "Obio-Akpor", "Bonny Island", "Rumuokoro"] },
  { stateId: "st-cross-river", names: ["Calabar North", "Calabar South", "Ikom Main", "Ogoja Assembly", "Akamkpa"] },
  { stateId: "st-akwa-ibom", names: ["Uyo Main Assembly", "Eket Branch", "Ikot Ekpene", "Oron Town", "Itu Central"] },
  { stateId: "st-lagos", names: ["Ikeja Main", "Lekki Phase 1", "Surulere Central", "Ajah Assembly", "Yaba Branch", "Apapa Outpost"] },
  { stateId: "st-fct", names: ["Wuse II Assembly", "Garki Central", "Gwarinpa", "Kubwa", "Asokoro Outpost"] },
  { stateId: "st-enugu", names: ["Enugu Central", "Nsukka Main", "Independence Layout", "Abakpa"] },
  { stateId: "st-anambra", names: ["Awka Main", "Onitsha Central", "Nnewi Assembly", "Ekwulobia"] },
  { stateId: "st-delta", names: ["Asaba Central", "Warri Main", "Sapele Branch", "Ughelli Assembly", "Effurun"] },
  { stateId: "st-edo", names: ["Benin Central", "Auchi Main", "Ekpoma", "Uromi Branch", "GRA Outpost"] },
];

export const branches: Branch[] = [];
let bIdx = 0;
branchSeeds.forEach(({ stateId, names }) => {
  names.forEach((n, i) => {
    bIdx++;
    branches.push({
      id: `br-${String(bIdx).padStart(3, "0")}`,
      name: n,
      stateId,
      districtId: i < Math.ceil(names.length / 2) ? `${stateId}-d1` : `${stateId}-d2`,
      address: `${10 + i} Faith Avenue, ${n.split(" ")[0]}`,
      foundedYear: 1995 + ((bIdx * 3) % 25),
      seniorPastorId: "", // set later
      phone: `+234 80${(3000000 + bIdx * 137) % 10000000}`,
      status: "Active",
    });
  });
});

/* --------------------------------- PASTORS -------------------------------- */
const firstNames = [
  "Emeka", "Chinedu", "Tunde", "Femi", "Ifeanyi", "Bola", "Yemi", "Segun",
  "Obinna", "Kelechi", "Sola", "Tobi", "Uche", "Nnamdi", "Ayo", "Bayo",
  "Chuka", "Dapo", "Wale", "Kunle", "Ngozi", "Adaeze", "Ifeoma", "Funmi",
  "Bisi", "Chioma", "Amaka", "Tope", "Bukola", "Lola", "Yetunde", "Ronke",
  "Ebuka", "Tochukwu", "Olumide", "Damilola", "Gbenga", "Sade", "Patience", "Mercy",
];
const lastNames = [
  "Nwachukwu", "Adeyemi", "Okafor", "Olawale", "Eze", "Okonkwo", "Bello", "Adebayo",
  "Ajayi", "Ogundipe", "Mbah", "Iwuala", "Onyema", "Akpan", "Effiong", "Etim",
  "Bassey", "Inyang", "Udo", "Williams", "Johnson", "Olayinka", "Adetola", "Sanusi",
  "Ifeanyi", "Obi", "Anyanwu", "Chukwuma", "Dada", "Falade",
];

const ranks: PastoralRank[] = ["Deacon", "Pastor", "Senior Pastor", "Zonal Pastor", "State Pastor"];

export const pastors: Pastor[] = [];
// 9 state pastors first (one per state)
states.forEach((s, i) => {
  const id = `p-${String(i + 1).padStart(3, "0")}`;
  pastors.push({
    id,
    firstName: firstNames[i],
    lastName: lastNames[i],
    rank: "State Pastor",
    status: "Active",
    branchId: null,
    stateId: s.id,
    email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@jnic.org`,
    phone: `+234 80${(2000000 + i * 91) % 10000000}`,
    ordainedAt: `${1998 + i}-0${(i % 9) + 1}-15`,
    qualifications: "B.A. Theology, M.Div",
    emergencyContact: `+234 80${(9000000 + i * 11) % 10000000}`,
  });
});
// Remaining 133 pastors distributed across branches
let pIdx = 10;
const seniorAssigned = new Set<string>();
branches.forEach((br, brIdx) => {
  // each branch: 1 senior pastor + 2-3 regular pastors/deacons
  const count = 3 + (brIdx % 3); // 3..5
  for (let k = 0; k < count; k++) {
    const id = `p-${String(pIdx).padStart(3, "0")}`;
    let rank: PastoralRank;
    if (k === 0 && !seniorAssigned.has(br.id)) {
      rank = brIdx % 5 === 0 ? "Zonal Pastor" : "Senior Pastor";
      seniorAssigned.add(br.id);
      br.seniorPastorId = id;
    } else if (k === 1) rank = "Pastor";
    else rank = k % 2 === 0 ? "Pastor" : "Deacon";

    const fn = firstNames[(pIdx * 7) % firstNames.length];
    const ln = lastNames[(pIdx * 13) % lastNames.length];
    const status: Pastor["status"] = pIdx % 19 === 0 ? "On Leave" : pIdx % 31 === 0 ? "Transferred" : "Active";
    pastors.push({
      id,
      firstName: fn,
      lastName: ln,
      rank,
      status,
      branchId: br.id,
      stateId: br.stateId,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${pIdx}@jnic.org`,
      phone: `+234 80${(1000000 + pIdx * 173) % 10000000}`,
      ordainedAt: `${2005 + (pIdx % 18)}-${String(((pIdx * 3) % 12) + 1).padStart(2, "0")}-${String(((pIdx * 5) % 27) + 1).padStart(2, "0")}`,
      qualifications: ["B.A. Theology", "Diploma in Pastoral Studies", "M.Div", "B.Sc + Cert. Ministry"][pIdx % 4],
      emergencyContact: `+234 80${(8000000 + pIdx * 23) % 10000000}`,
    });
    pIdx++;
    if (pastors.length >= 142) return;
  }
});
// fill remaining if short
while (pastors.length < 142) {
  const id = `p-${String(pIdx).padStart(3, "0")}`;
  const fn = firstNames[(pIdx * 7) % firstNames.length];
  const ln = lastNames[(pIdx * 13) % lastNames.length];
  const br = branches[pIdx % branches.length];
  pastors.push({
    id, firstName: fn, lastName: ln, rank: "Deacon", status: "Active",
    branchId: br.id, stateId: br.stateId,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${pIdx}@jnic.org`,
    phone: `+234 80${(1000000 + pIdx * 173) % 10000000}`,
    ordainedAt: `2018-06-10`, qualifications: "Diploma in Pastoral Studies",
    emergencyContact: `+234 80${(8000000 + pIdx * 23) % 10000000}`,
  });
  pIdx++;
}
// Ensure every branch has senior pastor assigned
branches.forEach((br) => {
  if (!br.seniorPastorId) {
    const cand = pastors.find(p => p.branchId === br.id);
    if (cand) br.seniorPastorId = cand.id;
  }
});

/* -------------------------------- TRANSFERS ------------------------------- */
export const transfers: Transfer[] = [
  // 4 pending
  ...Array.from({ length: 4 }).map<Transfer>((_, i) => ({
    id: `tr-p-${i + 1}`,
    pastorId: pastors[10 + i * 3].id,
    fromBranchId: pastors[10 + i * 3].branchId!,
    toBranchId: branches[(i * 7) % branches.length].id,
    requestedById: pastors[i].id,
    requestedAt: `2025-05-${String(8 - i).padStart(2, "0")}T09:30:00Z`,
    effectiveDate: `2025-06-${String(15 - i * 2).padStart(2, "0")}`,
    reason: ["Strategic redeployment to strengthen growing branch", "Leadership succession plan", "Cross-state ministry expansion", "Family relocation request"][i],
    status: "Pending",
  })),
  // 12 historical
  ...Array.from({ length: 12 }).map<Transfer>((_, i) => ({
    id: `tr-h-${i + 1}`,
    pastorId: pastors[20 + i * 4].id,
    fromBranchId: branches[(i * 5) % branches.length].id,
    toBranchId: branches[(i * 11 + 3) % branches.length].id,
    requestedById: pastors[i % 9].id,
    requestedAt: `2024-${String(((i * 2) % 12) + 1).padStart(2, "0")}-12T08:00:00Z`,
    effectiveDate: `2024-${String(((i * 2) % 12) + 1).padStart(2, "0")}-25`,
    reason: "Organisational restructuring",
    status: i % 7 === 0 ? "Rejected" : "Approved",
  })),
];

/* --------------------------------- REPORTS -------------------------------- */
const periods = ["Mar 2025", "Apr 2025"];
export const reports: BranchReport[] = [];
branches.forEach((br, i) => {
  periods.forEach((per, pi) => {
    const overdue = pi === 1 && i % 11 === 0;
    const pending = pi === 1 && i % 7 === 0 && !overdue;
    reports.push({
      id: `rp-${br.id}-${per.replace(/\s/g, "")}`,
      branchId: br.id,
      period: per,
      submittedById: br.seniorPastorId,
      submittedAt: overdue || pending ? null : `2025-${pi === 0 ? "04" : "05"}-${String(((i * 3) % 27) + 1).padStart(2, "0")}T10:00:00Z`,
      attendance: {
        adults: 80 + ((i * 17) % 320),
        youth: 30 + ((i * 11) % 120),
        children: 20 + ((i * 7) % 80),
      },
      salvations: (i * 3) % 25,
      baptisms: (i * 2) % 15,
      dedications: i % 10,
      cellGroups: { count: 4 + (i % 8), attendance: 30 + ((i * 5) % 90) },
      offering: 250000 + ((i * 73000) % 1500000),
      notes: "Strong growth in youth attendance. Mid-week services expanding.",
      status: overdue ? "Overdue" : pending ? "Pending" : i % 5 === 0 ? "Approved" : "Submitted",
    });
  });
});

/* --------------------------- WEEKLY BRANCH REPORTS ------------------------ */
const mayWeekEndings = ["2025-05-04", "2025-05-11", "2025-05-18", "2025-05-25"];
const CURRENT_MONTH = "May 2025";
const CURRENT_WEEK_ENDING = "2025-05-18";

export const weeklyReports: WeeklyBranchReport[] = [];
branches.forEach((br, i) => {
  mayWeekEndings.forEach((weekEnding, wi) => {
    const isCurrentWeek = weekEnding === CURRENT_WEEK_ENDING;
    const isPastWeek = weekEnding < CURRENT_WEEK_ENDING;
    const pending = isCurrentWeek;
    const overdue = false;
    const submitted = isPastWeek && !pending;
    weeklyReports.push({
      id: `wr-${br.id}-${weekEnding}`,
      branchId: br.id,
      weekEnding,
      month: CURRENT_MONTH,
      submittedById: br.seniorPastorId,
      submittedAt: submitted ? `${weekEnding}T10:00:00Z` : null,
      attendance: {
        adults: 80 + ((i * 17 + wi * 3) % 320),
        youth: 30 + ((i * 11 + wi * 2) % 120),
        children: 20 + ((i * 7 + wi) % 80),
      },
      salvations: (i + wi) % 8,
      baptisms: (i + wi) % 5,
      dedications: (i + wi) % 4,
      cellGroups: { count: 4 + (i % 8), attendance: 30 + ((i * 5 + wi * 4) % 90) },
      notes: wi === 0 ? "Strong youth turnout." : "",
      status: overdue ? "Overdue" : pending ? "Pending" : "Submitted",
    });
  });
});

/* ----------------------------- MONTHLY SUMMARIES -------------------------- */
export const monthlySummaries: MonthlySummary[] = [];
branches.forEach((br, i) => {
  const branchWeeks = weeklyReports.filter((w) => w.branchId === br.id && w.month === CURRENT_MONTH);
  const submittedWeeks = branchWeeks.filter((w) => w.status === "Submitted");
  const agg = submittedWeeks.reduce(
    (acc, w) => ({
      adults: acc.adults + w.attendance.adults,
      youth: acc.youth + w.attendance.youth,
      children: acc.children + w.attendance.children,
      salvations: acc.salvations + w.salvations,
      baptisms: acc.baptisms + w.baptisms,
      dedications: acc.dedications + w.dedications,
    }),
    { adults: 0, youth: 0, children: 0, salvations: 0, baptisms: 0, dedications: 0 },
  );
  monthlySummaries.push({
    id: `ms-${br.id}-May2025`,
    branchId: br.id,
    period: CURRENT_MONTH,
    submittedById: br.seniorPastorId,
    submittedAt: i % 9 === 0 ? "2025-05-12T14:00:00Z" : null,
    offering: 250000 + ((i * 73000) % 1500000),
    notes: "",
    status: i % 9 === 0 ? "Submitted" : "Pending",
    totals: {
      attendance: { adults: agg.adults, youth: agg.youth, children: agg.children },
      salvations: agg.salvations,
      baptisms: agg.baptisms,
      dedications: agg.dedications,
    },
    weeksSubmitted: submittedWeeks.length,
    weeksExpected: mayWeekEndings.length,
  });
});

export function aggregateWeeklyForMonth(branchId: string, month: string, weeks: WeeklyBranchReport[]) {
  const branchWeeks = weeks.filter((w) => w.branchId === branchId && w.month === month && w.status === "Submitted");
  const totals = branchWeeks.reduce(
    (acc, w) => ({
      adults: acc.adults + w.attendance.adults,
      youth: acc.youth + w.attendance.youth,
      children: acc.children + w.attendance.children,
      salvations: acc.salvations + w.salvations,
      baptisms: acc.baptisms + w.baptisms,
      dedications: acc.dedications + w.dedications,
    }),
    { adults: 0, youth: 0, children: 0, salvations: 0, baptisms: 0, dedications: 0 },
  );
  return { totals, weeksSubmitted: branchWeeks.length };
}

export { CURRENT_MONTH, CURRENT_WEEK_ENDING };

/* ------------------------------- REMITTANCE ------------------------------- */
const remitMonths = ["Nov 2024", "Dec 2024", "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025"];
export const remittances: Remittance[] = [];
branches.forEach((br, i) => {
  remitMonths.forEach((per, pi) => {
    const expected = 200000 + ((i * 41000) % 800000);
    const variant = (i + pi) % 5;
    const received = variant === 0 ? 0 : variant === 1 ? Math.round(expected * 0.6) : expected;
    const status: Remittance["status"] = received === 0 ? "Outstanding" : received < expected ? "Partial" : "Compliant";
    remittances.push({
      id: `rm-${br.id}-${pi}`,
      branchId: br.id,
      period: per,
      expected,
      received,
      reference: `JN/${br.id.toUpperCase()}/${pi}${(i * 7) % 99}`,
      paidAt: received ? `2025-${String(pi + 1).padStart(2, "0")}-${String((i % 25) + 1).padStart(2, "0")}` : null,
      method: i % 2 === 0 ? "Bank Transfer" : "Cash",
      status,
    });
  });
});

/* --------------------------------- LEAVE ---------------------------------- */
export const leaveRequests: LeaveRequest[] = [
  { id: "lv-1", pastorId: pastors[12].id, type: "Annual", fromDate: "2025-05-20", toDate: "2025-06-03", reason: "Annual rest and family time", status: "Pending", appliedAt: "2025-05-08T09:00:00Z" },
  { id: "lv-2", pastorId: pastors[18].id, type: "Medical", fromDate: "2025-05-12", toDate: "2025-05-26", reason: "Recovery after surgery", status: "Approved", appliedAt: "2025-05-05T11:30:00Z" },
  { id: "lv-3", pastorId: pastors[25].id, type: "Compassionate", fromDate: "2025-05-10", toDate: "2025-05-17", reason: "Bereavement — father", status: "Approved", appliedAt: "2025-05-09T08:15:00Z" },
  { id: "lv-4", pastorId: pastors[34].id, type: "Sabbatical", fromDate: "2025-07-01", toDate: "2025-09-30", reason: "Doctoral study sabbatical", status: "Pending", appliedAt: "2025-05-02T14:20:00Z" },
  { id: "lv-5", pastorId: pastors[41].id, type: "Annual", fromDate: "2025-04-15", toDate: "2025-04-29", reason: "Family vacation", status: "Approved", appliedAt: "2025-04-01T10:00:00Z" },
  { id: "lv-6", pastorId: pastors[55].id, type: "Annual", fromDate: "2025-06-01", toDate: "2025-06-21", reason: "Annual leave", status: "Pending", appliedAt: "2025-05-10T09:45:00Z" },
  { id: "lv-7", pastorId: pastors[63].id, type: "Medical", fromDate: "2025-05-05", toDate: "2025-05-12", reason: "Medical evaluation", status: "Rejected", appliedAt: "2025-04-30T16:30:00Z" },
  { id: "lv-8", pastorId: pastors[72].id, type: "Annual", fromDate: "2025-05-22", toDate: "2025-06-05", reason: "Family event", status: "Pending", appliedAt: "2025-05-11T07:50:00Z" },
  { id: "lv-9", pastorId: "demo-branch-pastor", type: "Annual", fromDate: "2025-06-10", toDate: "2025-06-24", reason: "Annual rest and family time", status: "Pending", appliedAt: "2025-05-12T11:00:00Z" },
];

/* --------------------------------- EVENTS --------------------------------- */
export const events: JNEvent[] = [
  { id: "ev-1", name: "JNIC National Convention 2025", type: "Convention", scope: "Org-Wide", scopeIds: [], startDate: "2025-08-12", endDate: "2025-08-17", location: "Lagos National Theatre", organiser: "HQ Office", description: "The flagship annual gathering of all JNIC churches across Nigeria. Five days of teaching, worship, and impartation." },
  { id: "ev-2", name: "Pastors' Leadership Retreat", type: "Retreat", scope: "Org-Wide", scopeIds: [], startDate: "2025-06-23", endDate: "2025-06-27", location: "Obudu Mountain Resort", organiser: "Office of the GO", description: "Strategic retreat for senior pastoral staff. Vision casting and rest." },
  { id: "ev-3", name: "Rivers State Crusade", type: "Crusade", scope: "State", scopeIds: ["st-rivers"], startDate: "2025-05-30", endDate: "2025-06-01", location: "Port Harcourt Polo Club", organiser: "State Office — Rivers", description: "Three nights of evangelism." },
  { id: "ev-4", name: "Youth Leaders Training", type: "Training", scope: "Org-Wide", scopeIds: [], startDate: "2025-07-08", endDate: "2025-07-10", location: "Abuja Conference Centre", organiser: "Youth Department", description: "Equipping youth leaders across all branches." },
  { id: "ev-5", name: "Calabar North Anniversary Service", type: "Service", scope: "Branch", scopeIds: ["br-006"], startDate: "2025-06-15", endDate: "2025-06-15", location: "Calabar North Branch", organiser: "Branch Pastor", description: "20th anniversary thanksgiving service." },
  { id: "ev-6", name: "Lagos Zone Workers' Conference", type: "Training", scope: "State", scopeIds: ["st-lagos"], startDate: "2025-09-05", endDate: "2025-09-07", location: "Ikeja Main Auditorium", organiser: "State Office — Lagos", description: "Workers' equipping conference." },
];

/* ------------------------------ ANNOUNCEMENTS ----------------------------- */
export const announcements: Announcement[] = [
  { id: "an-1", title: "Convention 2025 — Registration Opens", body: "Registration for the JNIC National Convention 2025 is now open. All branches must submit attendee lists by July 15. Branch heads should coordinate with their state offices.", scope: "All", scopeId: null, senderId: "p-001", senderRole: "HQ_ADMIN", priority: "Urgent", publishedAt: "2025-05-12T08:00:00Z", readBy: pastors.slice(0, 90).map(p => p.id), recipientCount: pastors.length },
  { id: "an-2", title: "April Remittance Reminder", body: "All branches with outstanding April remittances are required to settle by May 20. Reach out to the Finance Office for any clarifications.", scope: "All", scopeId: null, senderId: "p-001", senderRole: "HQ_ADMIN", priority: "Normal", publishedAt: "2025-05-10T09:30:00Z", readBy: pastors.slice(0, 110).map(p => p.id), recipientCount: pastors.length },
  { id: "an-3", title: "New Pastoral Code of Conduct (v3)", body: "The revised pastoral code of conduct has been published. Please review the document in the Document Library and acknowledge receipt before May 31.", scope: "All", scopeId: null, senderId: "p-001", senderRole: "GENERAL_OVERSEER", priority: "Urgent", publishedAt: "2025-05-08T07:15:00Z", readBy: pastors.slice(0, 75).map(p => p.id), recipientCount: pastors.length },
  { id: "an-4", title: "Rivers State Pastors' Meeting", body: "All Rivers State pastors are invited to the monthly state meeting on May 18 at the State Office, 9:00 AM prompt.", scope: "State", scopeId: "st-rivers", senderId: "p-001", senderRole: "STATE_PASTOR", priority: "Normal", publishedAt: "2025-05-09T10:00:00Z", readBy: pastors.filter(p => p.stateId === "st-rivers").slice(0, 8).map(p => p.id), recipientCount: pastors.filter(p => p.stateId === "st-rivers").length },
  { id: "an-5", title: "Lagos Zone Worker's Conference Update", body: "The Lagos zone workers' conference dates have been adjusted to September 5–7. Please update your branch calendars.", scope: "State", scopeId: "st-lagos", senderId: "p-004", senderRole: "STATE_PASTOR", priority: "Normal", publishedAt: "2025-05-06T11:00:00Z", readBy: pastors.filter(p => p.stateId === "st-lagos").slice(0, 10).map(p => p.id), recipientCount: pastors.filter(p => p.stateId === "st-lagos").length },
  { id: "an-6", title: "New Online Reporting Portal", body: "Branches can now submit monthly reports through the new portal. Training videos available in the Document Library.", scope: "All", scopeId: null, senderId: "p-001", senderRole: "HQ_ADMIN", priority: "Normal", publishedAt: "2025-05-04T13:00:00Z", readBy: pastors.slice(0, 130).map(p => p.id), recipientCount: pastors.length },
  { id: "an-7", title: "Calabar North 20th Anniversary", body: "The Calabar North branch will celebrate 20 years on June 15. All neighbouring branches are invited.", scope: "Branch", scopeId: "br-006", senderId: "p-002", senderRole: "BRANCH_PASTOR", priority: "Normal", publishedAt: "2025-05-02T09:00:00Z", readBy: pastors.filter(p => p.branchId === "br-006").map(p => p.id), recipientCount: pastors.filter(p => p.branchId === "br-006").length },
  { id: "an-8", title: "Q1 Financial Audit Complete", body: "The Q1 2025 audit has been completed. Branch summaries will be circulated to State Pastors this week.", scope: "All", scopeId: null, senderId: "p-001", senderRole: "GENERAL_OVERSEER", priority: "Normal", publishedAt: "2025-04-29T14:00:00Z", readBy: pastors.slice(0, 142).map(p => p.id), recipientCount: pastors.length },
];

/* -------------------------------- DOCUMENTS ------------------------------- */
export const docFolders: DocFolder[] = [
  { id: "fld-library", name: "JNIC Library", parentId: null, starred: false, trashedAt: null, createdAt: "2024-01-01", updatedAt: "2025-05-01" },
  { id: "fld-policies", name: "Policies", parentId: "fld-library", starred: true, trashedAt: null, createdAt: "2024-01-01", updatedAt: "2025-05-08" },
  { id: "fld-pastoral", name: "Pastoral", parentId: "fld-policies", starred: false, trashedAt: null, createdAt: "2024-02-01", updatedAt: "2025-05-08" },
  { id: "fld-finance", name: "Finance", parentId: "fld-policies", starred: false, trashedAt: null, createdAt: "2024-02-01", updatedAt: "2024-12-04" },
  { id: "fld-circulars", name: "Circulars", parentId: "fld-library", starred: false, trashedAt: null, createdAt: "2024-01-01", updatedAt: "2025-05-12" },
  { id: "fld-hq-directives", name: "HQ Directives", parentId: "fld-circulars", starred: false, trashedAt: null, createdAt: "2024-03-01", updatedAt: "2025-04-15" },
  { id: "fld-forms", name: "Forms", parentId: "fld-library", starred: false, trashedAt: null, createdAt: "2024-01-01", updatedAt: "2024-11-18" },
  { id: "fld-reports", name: "Reports", parentId: "fld-forms", starred: false, trashedAt: null, createdAt: "2024-04-01", updatedAt: "2024-10-01" },
  { id: "fld-hr", name: "HR", parentId: "fld-forms", starred: false, trashedAt: null, createdAt: "2024-04-01", updatedAt: "2024-07-22" },
  { id: "fld-constitution", name: "Constitution", parentId: "fld-library", starred: true, trashedAt: null, createdAt: "2024-01-01", updatedAt: "2024-09-12" },
  { id: "fld-certificates", name: "Certificates", parentId: "fld-library", starred: false, trashedAt: null, createdAt: "2024-01-01", updatedAt: "2024-06-10" },
];

export const documents: DocItem[] = [
  { id: "doc-1", name: "JNIC Constitution v4.pdf", folderId: "fld-constitution", category: "Constitution", uploadedById: "p-001", uploadedAt: "2024-09-12", sizeKb: 1834, visibility: "All", description: "Current constitution of the Jubilee Nation International Churches.", starred: true, trashedAt: null, lastAccessedAt: "2025-05-10T09:00:00Z" },
  { id: "doc-2", name: "Pastoral Code of Conduct (v3).pdf", folderId: "fld-pastoral", category: "Policy", uploadedById: "p-001", uploadedAt: "2025-05-08", sizeKb: 612, visibility: "All", description: "Revised pastoral conduct standards. Acknowledgement required.", starred: false, trashedAt: null, lastAccessedAt: "2025-05-11T14:30:00Z" },
  { id: "doc-3", name: "Monthly Report Template.pdf", folderId: "fld-reports", category: "Form", uploadedById: "p-001", uploadedAt: "2024-10-01", sizeKb: 188, visibility: "All", description: "Standardised template for branch monthly reports.", starred: false, trashedAt: null, lastAccessedAt: "2025-05-09T11:00:00Z" },
  { id: "doc-4", name: "HQ Circular 04/25.pdf", folderId: "fld-hq-directives", category: "Circular", uploadedById: "p-001", uploadedAt: "2025-04-15", sizeKb: 95, visibility: "State Pastors and above", description: "Quarterly directives from the General Overseer.", starred: false, trashedAt: null, lastAccessedAt: "2025-05-12T08:00:00Z" },
  { id: "doc-5", name: "Leave Application Form.pdf", folderId: "fld-hr", category: "Form", uploadedById: "p-001", uploadedAt: "2024-07-22", sizeKb: 76, visibility: "All", description: "Standard leave application form.", starred: false, trashedAt: null, lastAccessedAt: null },
  { id: "doc-6", name: "Ordination Certificate Template.pdf", folderId: "fld-certificates", category: "Certificate", uploadedById: "p-001", uploadedAt: "2024-06-10", sizeKb: 244, visibility: "HQ Only", description: "Master certificate template — controlled use.", starred: false, trashedAt: null, lastAccessedAt: null },
  { id: "doc-7", name: "Finance & Remittance Policy.pdf", folderId: "fld-finance", category: "Policy", uploadedById: "p-001", uploadedAt: "2024-12-04", sizeKb: 521, visibility: "All", description: "Branch remittance percentages, schedules, and methods.", starred: true, trashedAt: null, lastAccessedAt: "2025-05-08T16:00:00Z" },
  { id: "doc-8", name: "HQ Circular 03/25.pdf", folderId: "fld-hq-directives", category: "Circular", uploadedById: "p-001", uploadedAt: "2025-03-20", sizeKb: 88, visibility: "State Pastors and above", description: "Q1 directives.", starred: false, trashedAt: null, lastAccessedAt: "2025-05-07T10:00:00Z" },
  { id: "doc-9", name: "Convention 2025 Brochure.pdf", folderId: "fld-circulars", category: "Circular", uploadedById: "p-001", uploadedAt: "2025-05-12", sizeKb: 1220, visibility: "All", description: "Programme schedule and registration guide.", starred: false, trashedAt: null, lastAccessedAt: "2025-05-12T12:00:00Z" },
  { id: "doc-10", name: "Branch Audit Checklist.pdf", folderId: "fld-forms", category: "Form", uploadedById: "p-001", uploadedAt: "2024-11-18", sizeKb: 132, visibility: "State Pastors and above", description: "Used for quarterly branch audits.", starred: false, trashedAt: null, lastAccessedAt: null },
];

export function findDocFolder(id: string, folders: DocFolder[] = docFolders): DocFolder | undefined {
  return folders.find((f) => f.id === id);
}

export function folderAncestors(folderId: string, folders: DocFolder[] = docFolders): DocFolder[] {
  const chain: DocFolder[] = [];
  let current = findDocFolder(folderId, folders);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? findDocFolder(current.parentId, folders) : undefined;
  }
  return chain;
}

export function folderDescendantIds(folderId: string, folders: DocFolder[]): Set<string> {
  const ids = new Set<string>([folderId]);
  const walk = (parentId: string) => {
    for (const f of folders) {
      if (f.parentId === parentId) {
        ids.add(f.id);
        walk(f.id);
      }
    }
  };
  walk(folderId);
  return ids;
}

/* -------------------------------- AUDIT FEED ------------------------------ */
export const auditFeed: AuditEvent[] = [
  { id: "a1", icon: "transfer", description: `Pastor ${pastors[10].firstName} ${pastors[10].lastName} transferred to ${branches[3].name}`, actorId: "p-001", at: "2025-05-12T11:32:00Z" },
  { id: "a2", icon: "report", description: `${branches[5].name} submitted April monthly report`, actorId: branches[5].seniorPastorId, at: "2025-05-12T10:14:00Z" },
  { id: "a3", icon: "remit", description: `${branches[1].name} remitted ₦480,000 for April`, actorId: branches[1].seniorPastorId, at: "2025-05-12T09:50:00Z" },
  { id: "a4", icon: "leave", description: `Leave approved for ${pastors[18].firstName} ${pastors[18].lastName}`, actorId: "p-001", at: "2025-05-12T08:22:00Z" },
  { id: "a5", icon: "announcement", description: `Announcement published: "Convention 2025 — Registration Opens"`, actorId: "p-001", at: "2025-05-12T08:00:00Z" },
  { id: "a6", icon: "branch", description: `${branches[20].name} updated branch profile`, actorId: branches[20].seniorPastorId, at: "2025-05-11T16:40:00Z" },
  { id: "a7", icon: "transfer", description: `Transfer initiated for ${pastors[13].firstName} ${pastors[13].lastName}`, actorId: "p-002", at: "2025-05-11T14:05:00Z" },
  { id: "a8", icon: "report", description: `${branches[8].name} submitted April monthly report`, actorId: branches[8].seniorPastorId, at: "2025-05-11T11:11:00Z" },
  { id: "a9", icon: "event", description: `New event scheduled: "Pastors' Leadership Retreat"`, actorId: "p-001", at: "2025-05-11T09:30:00Z" },
  { id: "a10", icon: "remit", description: `${branches[12].name} marked as outstanding for April`, actorId: "p-001", at: "2025-05-11T08:00:00Z" },
  { id: "a11", icon: "report", description: `${branches[15].name} submitted April monthly report`, actorId: branches[15].seniorPastorId, at: "2025-05-10T18:30:00Z" },
  { id: "a12", icon: "leave", description: `Leave application from ${pastors[34].firstName} ${pastors[34].lastName} pending approval`, actorId: pastors[34].id, at: "2025-05-10T14:50:00Z" },
  { id: "a13", icon: "transfer", description: `Transfer rejected: ${pastors[63].firstName} ${pastors[63].lastName}`, actorId: "p-001", at: "2025-05-10T10:15:00Z" },
  { id: "a14", icon: "branch", description: `New branch added: ${branches[branches.length - 1].name}`, actorId: "p-001", at: "2025-05-09T15:20:00Z" },
  { id: "a15", icon: "announcement", description: `State announcement to Rivers pastors`, actorId: "p-001", at: "2025-05-09T11:00:00Z" },
];

/* ------------------------------ NOTIFICATIONS ----------------------------- */
export const notifications: Notification[] = [
  { id: "n1", type: "transfer", message: "A new transfer requires your approval", at: "2025-05-13T09:10:00Z", read: false, href: "/dashboard/transfers" },
  { id: "n2", type: "report", message: "Weekly report due for week ending May 18", at: "2025-05-13T08:00:00Z", read: false, href: "/dashboard/reports/weekly/submit" },
  { id: "n3", type: "announcement", message: "New announcement: Convention 2025 Registration", at: "2025-05-12T08:00:00Z", read: false, href: "/dashboard/announcements" },
  { id: "n4", type: "leave", message: "Leave approved for Pastor Emeka Nwachukwu", at: "2025-05-12T08:22:00Z", read: true, href: "/dashboard/leave" },
  { id: "n5", type: "remittance", message: "3 branches outstanding for April remittance", at: "2025-05-11T08:00:00Z", read: true, href: "/dashboard/finance" },
  { id: "n6", type: "report", message: "Calabar North submitted April report", at: "2025-05-10T18:30:00Z", read: true, href: "/dashboard/reports" },
  { id: "n7", type: "transfer", message: "Transfer approved for Pastor Funmi Adeyemi", at: "2025-05-09T11:30:00Z", read: true, href: "/dashboard/transfers" },
];

/* -------------------------------- HELPERS --------------------------------- */
export const findPastor = (id: string) => pastors.find(p => p.id === id);
export const findBranch = (id: string) => branches.find(b => b.id === id);
export const findState = (id: string) => states.find(s => s.id === id);
export const pastorName = (id: string | null | undefined) => {
  if (!id) return "—";
  const p = findPastor(id);
  return p ? `${p.firstName} ${p.lastName}` : "—";
};
export const branchName = (id: string | null | undefined) => findBranch(id ?? "")?.name ?? "—";
export const stateName = (id: string | null | undefined) => findState(id ?? "")?.name ?? "—";

/* --------------------------- ATTENDANCE TIMESERIES ------------------------ */
export const attendanceByStateMonthly = () => {
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  return months.map((m, i) => {
    const row: Record<string, number | string> = { month: m };
    states.slice(0, 4).forEach((s, si) => {
      row[s.name] = 1200 + si * 350 + i * 90 + ((i + si) * 41) % 200;
    });
    return row;
  });
};

export const attendanceByStateAll = () => {
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  return months.map((m, i) => {
    const row: Record<string, number | string> = { month: m };
    states.forEach((s, si) => {
      row[s.name] = 800 + si * 220 + i * 65 + ((i * si * 17) % 350);
    });
    return row;
  });
};

export const remittanceByStateCurrent = () => {
  return states.map((s, i) => {
    const stateBranches = branches.filter(b => b.stateId === s.id);
    const expected = stateBranches.length * 450000;
    const received = Math.round(expected * (0.55 + ((i * 7) % 40) / 100));
    return { state: s.name, expected, received };
  });
};

export const remittanceComplianceTrend = () => {
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  return months.map((m, i) => ({ month: m, compliance: 60 + ((i * 13 + 7) % 30) }));
};

export const reportSubmissionByState = () => {
  return states.map((s, i) => {
    const total = branches.filter(b => b.stateId === s.id).length;
    const submitted = Math.max(1, Math.round(total * (0.6 + ((i * 9) % 35) / 100)));
    return { state: s.name, submitted: Math.min(submitted, total), total };
  });
};

export const branchAttendanceTrend = (branchId: string) => {
  const weeks = ["W1", "W2", "W3", "W4", "W5", "W6"];
  const seed = branchId.charCodeAt(branchId.length - 1) || 5;
  return weeks.map((w, i) => ({ week: w, attendance: 180 + ((i * seed * 13) % 140) }));
};

/* ---------------------------------- TASKS --------------------------------- */
export const tasks: Task[] = [
  { id: "tk-1", title: "Submit weekly branch report", description: "Complete and submit the weekly report for this Sunday.", assigneeId: "p-010", assignerId: "p-001", dueDate: "2025-05-20", status: "Todo", priority: "High", scope: "Branch", scopeId: "br-001" },
  { id: "tk-2", title: "Review Rivers state compliance", description: "Review all branch reports and remittances for Rivers state.", assigneeId: "p-001", assignerId: "p-001", dueDate: "2025-05-22", status: "In Progress", priority: "High", scope: "State", scopeId: "st-rivers" },
  { id: "tk-3", title: "Prepare convention attendee list", description: "Compile branch attendee list for National Convention 2025.", assigneeId: "p-010", assignerId: "p-001", dueDate: "2025-07-15", status: "Todo", priority: "Medium", scope: "Branch", scopeId: "br-001" },
  { id: "tk-4", title: "Audit Q1 remittance records", description: "Cross-check all branch remittances for Q1 2025.", assigneeId: "p-001", assignerId: "p-001", dueDate: "2025-05-25", status: "Todo", priority: "High", scope: "Org-Wide", scopeId: null },
  { id: "tk-5", title: "Update branch profile", description: "Ensure branch contact details and pastor info are current.", assigneeId: "p-010", assignerId: "p-001", dueDate: "2025-05-18", status: "Done", priority: "Low", scope: "Branch", scopeId: "br-001" },
  { id: "tk-6", title: "Coordinate youth leaders training", description: "Confirm branch youth leader attendance for Abuja training.", assigneeId: "p-004", assignerId: "p-001", dueDate: "2025-07-01", status: "In Progress", priority: "Medium", scope: "State", scopeId: "st-lagos" },
  { id: "tk-7", title: "Usher team briefing", description: "Brief ushers for Sunday service order.", assigneeId: "p-011", assignerId: "p-010", dueDate: "2025-05-18", status: "Todo", priority: "Medium", scope: "Branch", scopeId: "br-001" },
  { id: "tk-8", title: "Approve pending transfers", description: "Review 4 pending pastoral transfer requests.", assigneeId: "p-001", assignerId: "p-001", dueDate: "2025-05-19", status: "Todo", priority: "High", scope: "Org-Wide", scopeId: null },
  { id: "tk-9", title: "Media setup for anniversary", description: "Prepare sound and projection for anniversary service.", assigneeId: "p-011", assignerId: "p-010", dueDate: "2025-06-14", status: "Todo", priority: "Medium", scope: "Branch", scopeId: "br-001" },
  { id: "tk-10", title: "State pastors meeting prep", description: "Prepare agenda for Rivers state pastors meeting.", assigneeId: "p-001", assignerId: "p-001", dueDate: "2025-05-17", status: "In Progress", priority: "Medium", scope: "State", scopeId: "st-rivers" },
];

/* ---------------------------------- INBOX --------------------------------- */
export const inboxMessages: InboxMessage[] = [
  { id: "in-1", subject: "April Remittance Reminder", body: "Your branch has an outstanding April remittance. Please settle by May 20.", fromId: "p-001", toId: "p-010", toRole: "BRANCH_PASTOR", read: false, at: "2025-05-12T09:00:00Z" },
  { id: "in-2", subject: "Transfer Notice — Pending Approval", body: "A pastoral transfer request requires your review as State Pastor.", fromId: "p-001", toId: "p-001", toRole: "STATE_PASTOR", read: false, at: "2025-05-13T08:30:00Z" },
  { id: "in-3", subject: "Convention Registration Opens", body: "Registration for JNIC National Convention 2025 is now open. Submit attendee lists by July 15.", fromId: "p-001", toId: null, toRole: "ALL", read: false, at: "2025-05-12T08:00:00Z" },
  { id: "in-4", subject: "Report Submission Overdue", body: "Your April monthly report is overdue. Please submit immediately.", fromId: "p-001", toId: "p-010", toRole: "BRANCH_PASTOR", read: true, at: "2025-05-11T10:00:00Z" },
  { id: "in-5", subject: "Pastors' Retreat — Save the Date", body: "The leadership retreat is scheduled for June 23–27 at Obudu Mountain Resort.", fromId: "p-001", toId: null, toRole: "ALL", read: true, at: "2025-05-10T14:00:00Z" },
  { id: "in-6", subject: "Usher roster for Sunday", body: "Please confirm your availability for usher duty this Sunday.", fromId: "p-010", toId: "p-011", toRole: "STAFF", read: false, at: "2025-05-13T07:00:00Z" },
  { id: "in-7", subject: "HQ Circular 04/25", body: "Quarterly directives from the General Overseer are available in the Document Library.", fromId: "p-001", toId: null, toRole: "STATE_PASTOR", read: false, at: "2025-05-09T11:00:00Z" },
  { id: "in-8", subject: "Leave application received", body: "Your leave application for June 1–21 is pending approval.", fromId: "p-001", toId: "p-010", toRole: "BRANCH_PASTOR", read: true, at: "2025-05-10T09:45:00Z" },
];

/* ----------------------------- SERVICE PLANS ------------------------------ */
export const servicePlans: ServicePlan[] = [
  {
    id: "sp-1", branchId: "br-001", date: "2025-05-18", theme: "Walking in Divine Favour",
    segments: [
      { id: "sg-1", title: "Opening Prayer", duration: 5, assignee: "Deacon Team" },
      { id: "sg-2", title: "Praise & Worship", duration: 25, assignee: "Worship Team" },
      { id: "sg-3", title: "Testimonies", duration: 10, assignee: "Pastor Emeka" },
      { id: "sg-4", title: "Word Ministration", duration: 45, assignee: "Pastor Emeka" },
      { id: "sg-5", title: "Offering & Announcements", duration: 10, assignee: "Usher Team" },
      { id: "sg-6", title: "Altar Call & Closing", duration: 15, assignee: "Pastor Emeka" },
    ],
    notes: "Special focus on youth engagement this Sunday.",
  },
  {
    id: "sp-2", branchId: "br-001", date: "2025-05-11", theme: "The Power of Unity",
    segments: [
      { id: "sg-7", title: "Opening Prayer", duration: 5, assignee: "Deacon Team" },
      { id: "sg-8", title: "Praise & Worship", duration: 20, assignee: "Worship Team" },
      { id: "sg-9", title: "Word Ministration", duration: 40, assignee: "Pastor Emeka" },
      { id: "sg-10", title: "Closing", duration: 10, assignee: "Pastor Emeka" },
    ],
    notes: "Mid-month communion service.",
  },
];

/* --------------------------- COMPLIANCE SNAPSHOTS ------------------------- */
export const complianceSnapshots: ComplianceSnapshot[] = branches.map((br, i) => {
  const rep = reports.find((r) => r.branchId === br.id && r.period === "Apr 2025");
  const rem = remittances.find((r) => r.branchId === br.id && r.period === "Apr 2025");
  return {
    branchId: br.id,
    period: "Apr 2025",
    reportDue: "2025-05-15",
    reportStatus: rep?.status ?? "Pending",
    remitDue: "2025-05-20",
    remitStatus: rem?.status ?? "Outstanding",
  };
});

/* ------------------------------- STAFF ------------------------------------ */
export const staffMembers: StaffMember[] = [
  { id: "stf-1", name: "Grace Okoro", role: "Administrative Assistant", branchId: "br-001", stateId: "st-rivers", phone: "+234 803 555 1010", email: "grace.okoro@jnic.org", employmentType: "branch", monthlySalary: 250000 },
  { id: "stf-2", name: "Samuel Ade", role: "Media Coordinator", branchId: "br-001", stateId: "st-rivers", phone: "+234 803 555 1011", email: "samuel.ade@jnic.org", employmentType: "branch", monthlySalary: 280000 },
  { id: "stf-3", name: "Blessing Eze", role: "Usher Lead", branchId: "br-001", stateId: "st-rivers", phone: "+234 803 555 1012", email: "blessing.eze@jnic.org", employmentType: "branch", monthlySalary: 180000 },
  { id: "stf-4", name: "David Okafor", role: "Finance Officer", branchId: "br-001", stateId: "st-rivers", phone: "+234 803 555 1013", email: "david.okafor@jnic.org", employmentType: "branch", monthlySalary: 320000 },
  { id: "stf-5", name: "Faith Johnson", role: "Children's Church Lead", branchId: "br-001", stateId: "st-rivers", phone: "+234 803 555 1014", email: "faith.johnson@jnic.org", employmentType: "branch", monthlySalary: 200000 },
  { id: "stf-6", name: "Peter Bello", role: "Protocol Officer", branchId: "br-001", stateId: "st-rivers", phone: "+234 803 555 1015", email: "peter.bello@jnic.org", employmentType: "branch", monthlySalary: 190000 },
  { id: "stf-7", name: "Mary Akpan", role: "Administrative Assistant", branchId: "br-016", stateId: "st-lagos", phone: "+234 803 555 2010", email: "mary.akpan@jnic.org", employmentType: "branch", monthlySalary: 260000 },
  { id: "stf-8", name: "James Williams", role: "Media Coordinator", branchId: "br-016", stateId: "st-lagos", phone: "+234 803 555 2011", email: "james.williams@jnic.org", employmentType: "branch", monthlySalary: 290000 },
  { id: "stf-9", name: "Chidi Nwosu", role: "Church Administrator", branchId: "br-001", stateId: "st-rivers", phone: "+234 803 555 1016", email: "staff@jnic.org", employmentType: "branch", monthlySalary: 220000 },
  { id: "stf-hq-1", name: "HQ Admin", role: "Operations Manager", branchId: "hq", stateId: "st-rivers", phone: "+234 803 555 0001", email: "admin@jnic.org", employmentType: "hq", monthlySalary: 450000 },
  { id: "stf-hq-2", name: "Rita Ogunleye", role: "HR Coordinator", branchId: "hq", stateId: "st-rivers", phone: "+234 803 555 0002", email: "rita.ogunleye@jnic.org", employmentType: "hq", monthlySalary: 380000 },
  { id: "stf-hq-3", name: "Emmanuel Bassey", role: "Accounts Officer", branchId: "hq", stateId: "st-rivers", phone: "+234 803 555 0003", email: "emmanuel.bassey@jnic.org", employmentType: "hq", monthlySalary: 400000 },
];

/* ------------------------------- WALLETS ---------------------------------- */
export const ORG_WALLET_ID = "wal-org-hq";

const payrollPastorIds = ["p-001", "p-010", "p-011", "p-012", "p-020", "p-030"];

function staffWalletId(id: string) {
  return `wal-staff-${id}`;
}

function pastorWalletId(id: string) {
  return `wal-pastor-${id}`;
}

function hqWalletId(id: string) {
  return `wal-hq-${id}`;
}

export const orgWallet: WalletAccount = {
  id: ORG_WALLET_ID,
  ownerType: "org",
  ownerId: "hq",
  balance: 50_000_000,
};

export const walletAccounts: WalletAccount[] = [
  orgWallet,
  ...staffMembers.map((s) => ({
    id: s.employmentType === "hq" ? hqWalletId(s.id) : staffWalletId(s.id),
    ownerType: (s.employmentType === "hq" ? "hq" : "staff") as PayeeType,
    ownerId: s.id,
    balance: s.id === "stf-4" ? 320000 : 0,
    paystackDva: createMockPaystackDva(s.name, s.id),
    payoutBank:
      s.id === "stf-4"
        ? { bankName: "GTBank", accountNumber: "0123456789", accountName: "David Okafor" }
        : s.id === "stf-hq-2"
          ? { bankName: "Access Bank", accountNumber: "0987654321", accountName: "Rita Ogunleye" }
          : undefined,
  })),
  ...payrollPastorIds.map((id) => ({
    id: pastorWalletId(id),
    ownerType: "pastor" as const,
    ownerId: id,
    balance: id === "p-011" ? 250000 : 0,
    paystackDva: createMockPaystackDva(pastorName(id), id),
    payoutBank:
      id === "p-011"
        ? { bankName: "First Bank", accountNumber: "3012345678", accountName: pastorName(id) }
        : undefined,
  })),
];

export const walletTransactions: WalletTransaction[] = [
  {
    id: "wtx-1",
    walletAccountId: ORG_WALLET_ID,
    type: "top_up",
    amount: 30_000_000,
    balanceAfter: 30_000_000,
    reference: "TXN-2025-001",
    description: "Initial payroll funding",
    actorId: "demo-admin",
    at: "2025-05-01T10:00:00Z",
    status: "Completed",
  },
  {
    id: "wtx-2",
    walletAccountId: ORG_WALLET_ID,
    type: "top_up",
    amount: 25_000_000,
    balanceAfter: 55_000_000,
    reference: "TXN-2025-002",
    description: "Q2 payroll top-up",
    actorId: "demo-admin",
    at: "2025-05-15T14:30:00Z",
    status: "Completed",
  },
  {
    id: "wtx-3",
    walletAccountId: ORG_WALLET_ID,
    type: "payroll_debit",
    amount: 5_000_000,
    balanceAfter: 50_000_000,
    reference: "PAY-MAY-2025",
    description: "May 2025 payroll disbursement",
    payrollRunId: "pr-1",
    actorId: "demo-admin",
    at: "2025-05-28T09:00:00Z",
    status: "Completed",
  },
  {
    id: "wtx-4",
    walletAccountId: staffWalletId("stf-4"),
    type: "salary_credit",
    amount: 320000,
    balanceAfter: 320000,
    reference: "PAY-MAY-2025",
    description: "May 2025 salary",
    payrollRunId: "pr-1",
    actorId: "demo-admin",
    at: "2025-05-28T09:00:00Z",
    status: "Completed",
  },
  {
    id: "wtx-5",
    walletAccountId: pastorWalletId("p-011"),
    type: "salary_credit",
    amount: 450000,
    balanceAfter: 450000,
    reference: "PAY-MAY-2025",
    description: "May 2025 salary",
    payrollRunId: "pr-1",
    actorId: "demo-admin",
    at: "2025-05-28T09:00:00Z",
    status: "Completed",
  },
  {
    id: "wtx-6",
    walletAccountId: pastorWalletId("p-011"),
    type: "withdrawal",
    amount: 200000,
    balanceAfter: 250000,
    reference: "TRF_2025_001",
    description: "Paystack transfer to bank",
    actorId: "demo-staff",
    at: "2025-06-02T09:00:00Z",
    status: "Completed",
  },
];

export const payrollRuns: PayrollRun[] = [
  {
    id: "pr-1",
    period: "May 2025",
    fileName: "may-2025-payroll.csv",
    uploadedById: "demo-admin",
    uploadedAt: "2025-05-28T09:00:00Z",
    totalAmount: 5_000_000,
    lineCount: 42,
    status: "Completed",
    lines: [
      { personType: "staff", personId: "stf-4", name: "David Okafor", amount: 320000, status: "paid" },
      { personType: "pastor", personId: "p-011", name: pastorName("p-011"), amount: 450000, status: "paid" },
    ],
  },
];

export function payeeDisplayName(personType: PayeeType, personId: string): string {
  if (personType === "pastor") return pastorName(personId);
  const staff = staffMembers.find((s) => s.id === personId);
  return staff?.name ?? "—";
}

export function findWalletByOwner(ownerType: WalletAccount["ownerType"], ownerId: string): WalletAccount | undefined {
  return walletAccounts.find((w) => w.ownerType === ownerType && w.ownerId === ownerId);
}

export function findWalletAccount(id: string): WalletAccount | undefined {
  return walletAccounts.find((w) => w.id === id);
}

export function walletOwnerName(account: WalletAccount): string {
  if (account.ownerType === "org") return "HQ Payroll Wallet";
  return payeeDisplayName(account.ownerType, account.ownerId);
}

export const ministryImpactByState = () =>
  states.map((s, i) => {
    const stateBranches = branches.filter((b) => b.stateId === s.id);
    const stateReports = reports.filter((r) => stateBranches.some((b) => b.id === r.branchId) && r.period === "Apr 2025");
    const totalAttendance = stateReports.reduce(
      (sum, r) => sum + r.attendance.adults + r.attendance.youth + r.attendance.children,
      0,
    );
    const salvations = stateReports.reduce((sum, r) => sum + r.salvations, 0);
    const baptisms = stateReports.reduce((sum, r) => sum + r.baptisms, 0);
    return { state: s.name, attendance: totalAttendance || 800 + i * 200, salvations: salvations || 20 + i * 5, baptisms: baptisms || 10 + i * 3, growth: 5 + ((i * 7) % 15) };
  });

export const salvationsTrend = () => {
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  return months.map((m, i) => ({ month: m, salvations: 120 + i * 35 + ((i * 13) % 40), baptisms: 60 + i * 18 + ((i * 7) % 25) }));
};
