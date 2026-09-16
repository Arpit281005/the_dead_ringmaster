/**
 * Regression checks for QR slot binding + scan idempotency.
 * Run: npx tsx scripts/scan-idempotency-check.ts
 */
import assert from "node:assert/strict";
import {
  createSignedQrPayload,
  verifySignedQrPayload,
  storyNodeSlot,
  decoyNodeSlot,
} from "../lib/qr-token";

function main() {
  const slot = storyNodeSlot(0);
  const token = "abcdefghij";
  const payload = createSignedQrPayload(slot, token);
  const verified = verifySignedQrPayload(payload);
  assert.ok(verified);
  assert.equal(verified!.nodeSlot, slot);
  assert.equal(verified!.token, token);

  // Same sticker payload verifies identically for every team — no global spend.
  const again = verifySignedQrPayload(payload);
  assert.deepEqual(again, verified);

  const decoySlot = decoyNodeSlot("clxyz123");
  const decoyPayload = createSignedQrPayload(decoySlot, "tokenseed1");
  assert.equal(verifySignedQrPayload(decoyPayload)?.nodeSlot, decoySlot);

  assert.equal(verifySignedQrPayload("tampered.payload.here"), null);
  assert.equal(verifySignedQrPayload("S0.wrongtoken.badmac"), null);

  console.log("scan-idempotency-check: OK (QR multi-team slot binding)");
  console.log(
    "Note: DB-level story/decoy double-scan idempotency is enforced in scanNode (no second row / no second penalty)."
  );
}

main();
