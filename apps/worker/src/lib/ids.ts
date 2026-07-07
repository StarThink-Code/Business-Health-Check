import { customAlphabet } from "nanoid";

// Lowercase alphanumeric, no ambiguous characters — safe in URLs and easy to read aloud.
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 21);

export function newId(prefix: string): string {
  return `${prefix}_${nanoid()}`;
}
