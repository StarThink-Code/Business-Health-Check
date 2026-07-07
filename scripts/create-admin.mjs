#!/usr/bin/env node
// Generates a SQL INSERT for the first admin user, using the same PBKDF2
// scheme as apps/worker/src/lib/password.ts. Usage:
//   node scripts/create-admin.mjs <email> <password> "<name>"
// Then run the printed SQL with:
//   wrangler d1 execute bhc-db --local  --command "<sql>"
//   wrangler d1 execute bhc-db --remote --command "<sql>"

import { webcrypto as crypto } from "node:crypto";
import { randomUUID } from "node:crypto";

const [email, password, name = "Admin"] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: node scripts/create-admin.mjs <email> <password> "<name>"');
  process.exit(1);
}

const ITERATIONS = 100_000;

async function hashPassword(pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pw),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  const toB64 = (bytes) => Buffer.from(bytes).toString("base64");
  return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(new Uint8Array(bits))}`;
}

const hash = await hashPassword(password);
const id = `admin_${randomUUID().replace(/-/g, "")}`;
const escapedName = name.replace(/'/g, "''");
const escapedEmail = email.replace(/'/g, "''");

const sql = `INSERT INTO admin_users (id, email, password_hash, name) VALUES ('${id}', '${escapedEmail}', '${hash}', '${escapedName}');`;

console.log("\nRun this from apps/worker:\n");
console.log(`wrangler d1 execute bhc-db --local --command "${sql.replace(/"/g, '\\"')}"`);
console.log(`wrangler d1 execute bhc-db --remote --command "${sql.replace(/"/g, '\\"')}"`);
