import type { PayrollLine, PayeeType } from "@/lib/data/types";
import { pastors, staffMembers, payeeDisplayName } from "@/lib/data/seed";

const VALID_TYPES = new Set<PayeeType>(["staff", "pastor", "hq"]);

export interface ParsePayrollResult {
  lines: PayrollLine[];
  errors: string[];
}

function parseCsvLine(line: string): string[] {
  return line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
}

function validatePayee(personType: PayeeType, personId: string): string | undefined {
  if (personType === "pastor") {
    if (!pastors.some((p) => p.id === personId)) return `Unknown pastor: ${personId}`;
    return undefined;
  }
  const staff = staffMembers.find((s) => s.id === personId);
  if (!staff) return `Unknown ${personType} employee: ${personId}`;
  if (personType === "hq" && staff.employmentType !== "hq") {
    return `${personId} is not an HQ employee`;
  }
  if (personType === "staff" && staff.employmentType !== "branch") {
    return `${personId} is not a branch staff member`;
  }
  return undefined;
}

export function parsePayrollCsv(text: string): ParsePayrollResult {
  const errors: string[] = [];
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (rows.length < 2) {
    return { lines: [], errors: ["CSV must include a header row and at least one data row"] };
  }

  const header = parseCsvLine(rows[0]).map((h) => h.toLowerCase());
  const typeIdx = header.indexOf("person_type");
  const idIdx = header.indexOf("person_id");
  const amountIdx = header.indexOf("amount");

  if (typeIdx === -1 || idIdx === -1 || amountIdx === -1) {
    return {
      lines: [],
      errors: ["CSV must have columns: person_type, person_id, amount"],
    };
  }

  const lines: PayrollLine[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cols = parseCsvLine(rows[i]);
    const rawType = cols[typeIdx]?.toLowerCase();
    const personId = cols[idIdx];
    const rawAmount = cols[amountIdx];

    if (!rawType || !personId || !rawAmount) {
      errors.push(`Row ${i + 1}: missing required fields`);
      lines.push({
        personType: "staff",
        personId: personId || "",
        name: "—",
        amount: 0,
        status: "failed",
        error: "Missing required fields",
      });
      continue;
    }

    if (!VALID_TYPES.has(rawType as PayeeType)) {
      errors.push(`Row ${i + 1}: invalid person_type "${rawType}"`);
      lines.push({
        personType: "staff",
        personId,
        name: "—",
        amount: 0,
        status: "failed",
        error: `Invalid person_type: ${rawType}`,
      });
      continue;
    }

    const personType = rawType as PayeeType;
    const amount = Number(rawAmount.replace(/,/g, ""));

    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push(`Row ${i + 1}: invalid amount "${rawAmount}"`);
      lines.push({
        personType,
        personId,
        name: payeeDisplayName(personType, personId),
        amount: 0,
        status: "failed",
        error: "Invalid amount",
      });
      continue;
    }

    const payeeError = validatePayee(personType, personId);
    if (payeeError) {
      errors.push(`Row ${i + 1}: ${payeeError}`);
      lines.push({
        personType,
        personId,
        name: payeeDisplayName(personType, personId),
        amount,
        status: "failed",
        error: payeeError,
      });
      continue;
    }

    lines.push({
      personType,
      personId,
      name: payeeDisplayName(personType, personId),
      amount,
      status: "pending",
    });
  }

  return { lines, errors };
}

export const PAYROLL_CSV_TEMPLATE = `person_type,person_id,amount
staff,stf-1,250000
pastor,p-010,450000
hq,stf-hq-1,380000`;
