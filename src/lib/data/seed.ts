import type {
  State, District, Branch, Pastor, Transfer, BranchReport, Remittance,
  LeaveRequest, JNEvent, Announcement, DocItem, AuditEvent, Notification, PastoralRank,
} from "./types";

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
export const documents: DocItem[] = [
  { id: "doc-1", name: "JNIC Constitution v4.pdf", category: "Constitution", uploadedById: "p-001", uploadedAt: "2024-09-12", sizeKb: 1834, visibility: "All", description: "Current constitution of the Jubilee Nation International Churches." },
  { id: "doc-2", name: "Pastoral Code of Conduct (v3).pdf", category: "Policy", uploadedById: "p-001", uploadedAt: "2025-05-08", sizeKb: 612, visibility: "All", description: "Revised pastoral conduct standards. Acknowledgement required." },
  { id: "doc-3", name: "Monthly Report Template.pdf", category: "Form", uploadedById: "p-001", uploadedAt: "2024-10-01", sizeKb: 188, visibility: "All", description: "Standardised template for branch monthly reports." },
  { id: "doc-4", name: "HQ Circular 04/25.pdf", category: "Circular", uploadedById: "p-001", uploadedAt: "2025-04-15", sizeKb: 95, visibility: "State Pastors and above", description: "Quarterly directives from the General Overseer." },
  { id: "doc-5", name: "Leave Application Form.pdf", category: "Form", uploadedById: "p-001", uploadedAt: "2024-07-22", sizeKb: 76, visibility: "All", description: "Standard leave application form." },
  { id: "doc-6", name: "Ordination Certificate Template.pdf", category: "Certificate", uploadedById: "p-001", uploadedAt: "2024-06-10", sizeKb: 244, visibility: "HQ Only", description: "Master certificate template — controlled use." },
  { id: "doc-7", name: "Finance & Remittance Policy.pdf", category: "Policy", uploadedById: "p-001", uploadedAt: "2024-12-04", sizeKb: 521, visibility: "All", description: "Branch remittance percentages, schedules, and methods." },
  { id: "doc-8", name: "HQ Circular 03/25.pdf", category: "Circular", uploadedById: "p-001", uploadedAt: "2025-03-20", sizeKb: 88, visibility: "State Pastors and above", description: "Q1 directives." },
  { id: "doc-9", name: "Convention 2025 Brochure.pdf", category: "Circular", uploadedById: "p-001", uploadedAt: "2025-05-12", sizeKb: 1220, visibility: "All", description: "Programme schedule and registration guide." },
  { id: "doc-10", name: "Branch Audit Checklist.pdf", category: "Form", uploadedById: "p-001", uploadedAt: "2024-11-18", sizeKb: 132, visibility: "State Pastors and above", description: "Used for quarterly branch audits." },
];

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
  { id: "n2", type: "report", message: "5 branches have not submitted April reports", at: "2025-05-13T08:00:00Z", read: false, href: "/dashboard/reports" },
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
