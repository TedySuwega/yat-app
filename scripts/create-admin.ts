// Run with: npm run db:create-admin -- admin@yolotrips.com your-secure-password

import { getDb } from "../lib/db";
import { CREATE_TABLES_SQL } from "../lib/schema";
import { hashPassword } from "../lib/password";

const [emailArg, passwordArg] = process.argv.slice(2);

if (!emailArg || !passwordArg) {
  console.error("Usage: npm run db:create-admin -- <email> <password>");
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const password = passwordArg;

if (!email.includes("@") || password.length < 8) {
  console.error("Provide a valid email and a password of at least 8 characters.");
  process.exit(1);
}

const db = getDb();
db.exec(CREATE_TABLES_SQL);

const existing = db
  .prepare("SELECT id FROM admin_users WHERE email = ?")
  .get(email) as { id: number } | undefined;

const passwordHash = hashPassword(password);

if (existing) {
  db.prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?").run(
    passwordHash,
    existing.id
  );
  console.log(`Updated admin password for ${email}`);
} else {
  db.prepare("INSERT INTO admin_users (email, password_hash) VALUES (?, ?)").run(
    email,
    passwordHash
  );
  console.log(`Created admin user ${email}`);
}
