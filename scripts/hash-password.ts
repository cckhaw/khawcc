import { hashPassword } from "../src/lib/auth-hash";

const pw = process.argv[2];
if (!pw) {
  console.error('Usage: npm run hash-password -- "your passphrase"');
  process.exit(1);
}
console.log(`ADMIN_PASSWORD_HASH="${hashPassword(pw)}"`);
