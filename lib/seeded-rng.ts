import { createHash } from "crypto";

/** Deterministic PRNG (mulberry32) seeded from teamSeed + node index + salt. */
export function seededRng(teamSeed: string, nodeIndex: number, salt = "default") {
  const hex = createHash("sha256").update(`${teamSeed}:${nodeIndex}:${salt}`).digest();
  let state = hex.readUInt32LE(0) || 1;

  function next(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    bool(): boolean {
      return next() < 0.5;
    },
    int(maxExclusive: number): number {
      if (maxExclusive <= 0) return 0;
      return Math.floor(next() * maxExclusive);
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new Error("seededRng.pick: empty list");
      return items[this.int(items.length)]!;
    },
  };
}
