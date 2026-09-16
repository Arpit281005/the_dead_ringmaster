import { createHmac, timingSafeEqual } from "crypto";

/**
 * Signed QR payload: `{nodeId}.{nonce}.{hmac}` where hmac = HMAC-SHA256(secret, `${nodeId}.${nonce}`).
 * Matches the build-prompt shape (opaque node id + nonce, server-side HMAC) without embedding a URL.
 */

function getSecret(): string {
  const secret = process.env.QR_HMAC_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-carnival-of-lies-qr-secret";
  }
  throw new Error("QR_HMAC_SECRET must be set (min 16 chars) in production.");
}

function sign(nodeId: string, nonce: string): string {
  return createHmac("sha256", getSecret()).update(`${nodeId}.${nonce}`).digest("base64url");
}

export function createSignedQrPayload(nodeId: string, nonce: string): string {
  return `${nodeId}.${nonce}.${sign(nodeId, nonce)}`;
}

export type VerifiedQrPayload = { nodeId: string; nonce: string };

export function verifySignedQrPayload(raw: string): VerifiedQrPayload | null {
  const parts = raw.trim().split(".");
  if (parts.length !== 3) return null;
  const [nodeId, nonce, mac] = parts;
  if (!nodeId || !nonce || !mac) return null;

  const expected = sign(nodeId, nonce);
  try {
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return { nodeId, nonce };
}
