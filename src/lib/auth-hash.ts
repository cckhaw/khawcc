import { randomBytes, scryptSync } from "node:crypto";

/** scrypt hash string: `scrypt:<saltHex>:<hashHex>`. Safe to import from scripts (no Next deps). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}
