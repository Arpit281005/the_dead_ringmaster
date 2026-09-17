import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "carnival_admin";
const MAX_AGE_SEC = 60 * 60 * 12; // 12h

function getAdminPassword(): string | null {
  // Bracket access avoids build-time inlining; trim handles Railway paste whitespace.
  const pw = process.env["ADMIN_PASSWORD"]?.trim();
  if (pw && pw.length >= 8) return pw;
  if (process.env.NODE_ENV !== "production") {
    return pw?.length ? pw : "carnival-dev-admin";
  }
  return null;
}

/** Signing key depends on password + server secrets — not forgeable from password alone. */
function sessionSigningKey(password: string): Buffer {
  const pepper =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.QR_HMAC_SECRET ||
    "dev-only-admin-session-pepper";
  return createHash("sha256").update(`carnival-admin-session:${password}:${pepper}`).digest();
}

function signSession(password: string, id: string, exp: number): string {
  const payload = `${id}.${exp}`;
  const mac = createHmac("sha256", sessionSigningKey(password)).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

function verifySignedSession(password: string, raw: string): boolean {
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [id, expStr, mac] = parts;
  if (!id || !expStr || !mac) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = signSession(password, id, exp);
  try {
    const a = Buffer.from(raw);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isAdminConfigured(): boolean {
  return getAdminPassword() !== null;
}

export async function verifyAdminSession(): Promise<boolean> {
  const password = getAdminPassword();
  if (!password) return false;
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;
  return verifySignedSession(password, raw);
}

export async function requireAdmin(): Promise<void> {
  if (!(await verifyAdminSession())) {
    redirect("/admin/login");
  }
}

export async function setAdminSession(passwordAttempt: string): Promise<boolean> {
  const password = getAdminPassword();
  if (!password) return false;
  try {
    const a = Buffer.from(passwordAttempt);
    const b = Buffer.from(password);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const id = randomBytes(24).toString("base64url");
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const jar = await cookies();
  jar.set(COOKIE, signSession(password, id, exp), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
    secure: process.env.NODE_ENV === "production",
  });
  return true;
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
