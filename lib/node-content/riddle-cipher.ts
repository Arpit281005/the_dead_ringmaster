import type { MirrorStyle } from "./types";

/** Shift N = max(1, key.length % 26). Letters only; case preserved. */
export function caesarShift(key: string): number {
  const n = key.replace(/[^A-Za-z]/g, "").length % 26;
  return Math.max(1, n);
}

function shiftChar(c: string, delta: number): string {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return String.fromCharCode(((code - 65 + delta + 26) % 26) + 65);
  }
  if (code >= 97 && code <= 122) {
    return String.fromCharCode(((code - 97 + delta + 26) % 26) + 97);
  }
  return c;
}

export function keyedObfuscate(text: string, key: string): string {
  const n = caesarShift(key);
  return [...text].map((c) => shiftChar(c, n)).join("");
}

export function keyedDeobfuscate(text: string, key: string): string {
  const n = caesarShift(key);
  return [...text].map((c) => shiftChar(c, -n)).join("");
}

export function applyMirrorStyle(text: string, style: MirrorStyle): string {
  switch (style) {
    case "reversed":
      return text.split(/\s+/).reverse().join(" ");
    case "directional":
      return text
        .replace(/\beast\b/gi, "⟦W⟧")
        .replace(/\bwest\b/gi, "east")
        .replace(/⟦W⟧/g, "west")
        .replace(/\bnorth\b/gi, "⟦S⟧")
        .replace(/\bsouth\b/gi, "north")
        .replace(/⟦S⟧/g, "south")
        .replace(/\bhighest\b/gi, "⟦L⟧")
        .replace(/\blowest\b/gi, "highest")
        .replace(/⟦L⟧/g, "lowest");
    case "negation":
      return text
        .replace(/\bwhere\b/gi, "where no")
        .replace(/\bfind\b/gi, "do not find")
        .replace(/\bseek\b/gi, "do not seek");
    case "antonym":
      return text
        .replace(/\bbrightest\b/gi, "⟦D⟧")
        .replace(/\bdimmest\b/gi, "brightest")
        .replace(/⟦D⟧/g, "dimmest")
        .replace(/\bemptiest\b/gi, "⟦F⟧")
        .replace(/\bfullest\b/gi, "emptiest")
        .replace(/⟦F⟧/g, "fullest")
        .replace(/\bhighest\b/gi, "⟦L⟧")
        .replace(/\blowest\b/gi, "highest")
        .replace(/⟦L⟧/g, "lowest");
    default:
      return text;
  }
}

/** Approximate inverse for volunteer hand-check; encode+decode round-trips via encode path. */
export function inverseMirrorStyle(text: string, style: MirrorStyle): string {
  switch (style) {
    case "reversed":
      return text.split(/\s+/).reverse().join(" ");
    case "directional":
      // Same swaps are involutions.
      return applyMirrorStyle(text, "directional");
    case "negation":
      return text
        .replace(/\bwhere no\b/gi, "where")
        .replace(/\bdo not find\b/gi, "find")
        .replace(/\bdo not seek\b/gi, "seek");
    case "antonym":
      return applyMirrorStyle(text, "antonym");
    default:
      return text;
  }
}

/** Encode: plaintext → keyed obfuscate → mirror → stage1 */
export function encodeStage1(plaintext: string, key: string, style: MirrorStyle): string {
  return applyMirrorStyle(keyedObfuscate(plaintext, key), style);
}

/** Decode: stage1 → inverse mirror → keyed deobfuscate → plaintext */
export function decodeStage1(stage1: string, key: string, style: MirrorStyle): string {
  return keyedDeobfuscate(inverseMirrorStyle(stage1, style), key);
}

export function normalizeCipherKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z]/g, "");
}
