/**
 * Password hashing via Web Crypto PBKDF2 (available natively in the Workers
 * runtime — no native/WASM bcrypt dependency needed).
 */
const ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedBits = await deriveBits(password, salt);
  return `pbkdf2$${ITERATIONS}$${toBase64(salt)}$${toBase64(new Uint8Array(derivedBits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  const salt = fromBase64(parts[2]!);
  const expected = fromBase64(parts[3]!);

  const derivedBits = new Uint8Array(await deriveBits(password, salt, iterations));
  if (derivedBits.length !== expected.length) return false;

  // Constant-time comparison to avoid timing side-channels.
  let diff = 0;
  for (let i = 0; i < derivedBits.length; i++) {
    diff |= derivedBits[i]! ^ expected[i]!;
  }
  return diff === 0;
}

async function deriveBits(
  password: string,
  salt: Uint8Array,
  iterations = ITERATIONS,
): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    keyMaterial,
    KEY_LENGTH_BITS,
  );
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}
