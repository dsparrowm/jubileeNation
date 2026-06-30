import type { PaystackDva } from "@/lib/data/types";

/** Mock Paystack DVA provisioning — replace with Paystack API in production. */
export function createMockPaystackDva(accountName: string, seed: string): PaystackDva {
  const hash = seed.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  const accountNumber = String(9_000_000_000 + (hash % 999_999_999)).padStart(10, "0");
  return {
    accountNumber,
    bankName: "Wema Bank",
    accountName,
    customerCode: `CUS_${seed.replace(/[^a-z0-9]/gi, "").toUpperCase()}`,
    dvaId: `DVA_${seed}`,
  };
}

export function mockPaystackTransferRef(): string {
  return `TRF_${Date.now().toString(36).toUpperCase()}`;
}
