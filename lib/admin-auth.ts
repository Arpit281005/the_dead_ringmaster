import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "carnival_admin";
const MAX_AGE = 60 * 60 * 12; // 12h

function getAdminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (pw && pw.length >= 8) return pw;
  if (process.env.NODE_ENV !== "production") {
    return process.env.ADMIN_PASSWORD?.length ? process.env.ADMIN_PASSWORD : "carnival-dev-admin";
  }
  return null;
}

function sessionToken(password: string): string {
  return createHash("sha256").update(`admin:${password}`).digest("base64url");
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
  const expected = sessionToken(password);
  try {
    const a = Buffer.from(raw);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
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
  const jar = await cookies();
  jar.set(COOKIE, sessionToken(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return true;
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}
