/**
 * Signed QR payload: `{nodeSlot}.{token}.{hmac16}`
 * hmac = first 16 chars of HMAC-SHA256(secret, `${nodeSlot}.${token}`) base64url.
 *
 * The printed sticker is stable and shared across all teams. Authorization is
 * always (team_id, node_slot → node) in scanNode — the sticker is never a
 * globally spent one-shot token.
 *
 * Changing MAC length or token size invalidates printed stickers — re-seed and
 * re-print after deploy.
 */

import { createHmac, timingSafeEqual } from "crypto";

const MAC_CHARS = 16;

function getSecret(): string {
  const secret = process.env.QR_HMAC_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "dev-only-carnival-of-lies-qr-secret";
  }
  throw new Error("QR_HMAC_SECRET must be set (min 16 chars) in production.");
}

function sign(nodeSlot: string, token: string): string {
  return createHmac("sha256", getSecret())
    .update(`${nodeSlot}.${token}`)
    .digest("base64url")
    .slice(0, MAC_CHARS);
}

export function createSignedQrPayload(nodeSlot: string, token: string): string {
  return `${nodeSlot}.${token}.${sign(nodeSlot, token)}`;
}

export type VerifiedQrPayload = { nodeSlot: string; token: string };

export function verifySignedQrPayload(raw: string): VerifiedQrPayload | null {
  const parts = raw.trim().split(".");
  if (parts.length !== 3) return null;
  const [nodeSlot, token, mac] = parts;
  if (!nodeSlot || !token || !mac) return null;
  if (mac.length !== MAC_CHARS) return null;

  const expected = sign(nodeSlot, token);
  try {
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return { nodeSlot, token };
}

/** Story print slots: S0 … S7 */
export function storyNodeSlot(sequenceIndex: number): string {
  return `S${sequenceIndex}`;
}

/** Decoy print slots: D{nodeId} */
export function decoyNodeSlot(nodeId: string): string {
  return `D${nodeId}`;
}
