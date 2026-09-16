import { createHash } from "crypto";

/** Stable, reproducible seed derived from team code — same code ⇒ same seed for the whole run. */
export function deriveTeamSeed(teamCode: string): string {
  return createHash("sha256").update(teamCode.trim().toUpperCase()).digest("hex").slice(0, 32);
}
