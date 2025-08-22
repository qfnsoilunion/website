import { createHash } from "crypto";

export function generateGovClientId(orgName: string, officeCode: string, officialEmailOrLetterNo: string): string {
  const input = `${orgName}${officeCode}${officialEmailOrLetterNo}`;
  return createHash("sha256").update(input).digest("hex").substring(0, 16).toUpperCase();
}
