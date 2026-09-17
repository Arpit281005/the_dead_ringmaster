"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { submitVerdict, unlockRiddle, acknowledgeRiddle } from "@/lib/actions";
import MarksReference from "@/components/MarksReference";

type Choice = "TRUTH" | "LIE";

type Result = {
  wasCorrect: boolean;
  riddle: string;
  clearedSuspectName: string | null;
  advanced: boolean;
  huntComplete: boolean;
  needsKey: boolean;
  keyPrompt: string | null;
  escalatedPenalty?: boolean;
};

export default function VerdictPanel({
  teamCode,
  nodeId,
  suspectName,
  locationName,
  testimonyText,
  retrying,
  initialResult = null,
}: {
  teamCode: string;
  nodeId: string;
  suspectName: string;
  locationName: string;
  testimonyText: string;
  retrying: boolean;
  initialResult?: Result | null;
}) {
  const router = useRouter();
  const [pendingChoice, setPendingChoice] = useState<Choice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(initialResult);
  const [unlocked, setUnlocked] = useState(() =>
    Boolean(initialResult && !initialResult.needsKey)
  );
  const [finalRiddle, setFinalRiddle] = useState<string | null>(() =>
    initialResult && !initialResult.needsKey ? initialResult.riddle : null
  );
  const [cipherInput, setCipherInput] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (!pendingChoice) return;
    setSubmitting(true);
    setError(null);
    const res = await submitVerdict(teamCode, nodeId, pendingChoice);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      setPendingChoice(null);
      return;
    }
    setResult(res.data);
    setUnlocked(!res.data.needsKey);
    if (!res.data.needsKey) setFinalRiddle(res.data.riddle);
    setPendingChoice(null);
  }

  async function unlock() {
    if (!cipherInput.trim()) return;
    setUnlocking(true);
    setError(null);
    const res = await unlockRiddle(teamCode, nodeId, cipherInput);
    setUnlocking(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setFinalRiddle(res.data.riddle);
    setUnlocked(true);
    setResult((prev) =>
      prev
        ? {
            ...prev,
            riddle: res.data.riddle,
            advanced: res.data.advanced,
            huntComplete: res.data.huntComplete,
            clearedSuspectName: res.data.clearedSuspectName ?? prev.clearedSuspectName,
            needsKey: false,
          }
        : prev
    );
  }

  /** Persist riddle-read + Act I advance before leaving (survives Server Action refresh). */
  async function continueAfterRiddle(href: string) {
    setContinuing(true);
    setError(null);
    const res = await acknowledgeRiddle(teamCode, nodeId);
    setContinuing(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult((prev) =>
      prev
        ? {
            ...prev,
            advanced: res.data.advanced || prev.advanced,
            huntComplete: res.data.huntComplete || prev.huntComplete,
          }
        : prev
    );
    router.push(href);
  }

  if (result) {
    const showKeyGate = result.needsKey && !unlocked;
    const displayRiddle = finalRiddle ?? result.riddle;
    // After Act II unlock, advanced may already be true; Act I uses wasCorrect until acknowledge.
    const showMidway =
      unlocked && result.wasCorrect && !result.huntComplete;
    const showAccuse = unlocked && result.wasCorrect && result.huntComplete;
    const showScanner = unlocked && !result.wasCorrect;

    return (
      <motion.div
        initial={initialResult ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="paper-card rounded-sm p-6 flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <motion.span
            initial={{ scale: 2.2, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="ink-stamp font-chrome text-sm uppercase px-3 py-1 rounded-sm"
          >
            {result.wasCorrect ? "Accepted" : "Misjudged"}
          </motion.span>
        </div>

        <div>
          <p className="font-chrome text-xs uppercase tracking-wide text-ink/50 mb-1">
            {showKeyGate
              ? "Cipher (not plain English yet)"
              : "The Riddle Reads"}
          </p>
          <p
            className={
              showKeyGate
                ? "font-mono text-base leading-relaxed break-words tracking-wide text-ink/90"
                : "font-display text-lg leading-snug break-words"
            }
          >
            {displayRiddle}
          </p>
        </div>

        {showKeyGate && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink/70">
              {result.keyPrompt ??
                "Find the cipher word in this testimony or your Case Notes."}
            </p>
            <div className="flex gap-2">
              <input
                value={cipherInput}
                onChange={(e) => setCipherInput(e.target.value)}
                className="flex-1 border border-ink/30 bg-parchment px-3 py-3 rounded-sm font-chrome tracking-wide uppercase focus:outline-none focus:border-oxblood"
                placeholder="Cipher word"
                autoCapitalize="characters"
                autoCorrect="off"
              />
              <button
                type="button"
                onClick={unlock}
                disabled={unlocking || !cipherInput.trim()}
                className="btn-oxblood font-chrome uppercase text-xs px-4 rounded-sm"
              >
                {unlocking ? "…" : "Unlock"}
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-oxblood text-sm">{error}</p>}

        {unlocked && result.clearedSuspectName && (
          <p className="text-sm text-teal">
            <strong>{result.clearedSuspectName}</strong> is cleared.
          </p>
        )}

        {result.escalatedPenalty && (
          <p className="text-sm text-oxblood leading-relaxed">
            The fairground grows impatient — a heavier fine has been applied for repeated
            misjudgments at this tent.
          </p>
        )}

        {unlocked && !result.wasCorrect && !result.escalatedPenalty && (
          <p className="text-sm text-oxblood leading-relaxed">
            Something doesn&apos;t sit right. Follow the riddle — if it leads to a dead end, scan
            what you find there, then return and weigh the testimony again.
          </p>
        )}

        {unlocked && !result.wasCorrect && result.escalatedPenalty && (
          <p className="text-sm text-oxblood leading-relaxed">
            Follow the riddle to the dead end, scan what you find, then weigh the testimony again.
          </p>
        )}

        {unlocked && (
          <div className="flex flex-col gap-2">
            {showMidway && (
              <button
                type="button"
                disabled={continuing}
                onClick={() => continueAfterRiddle(`/team/${teamCode}`)}
                className="btn-oxblood font-chrome uppercase text-sm py-3 rounded-sm"
              >
                {continuing ? "…" : "Return to the Midway"}
              </button>
            )}
            {showAccuse && (
              <button
                type="button"
                disabled={continuing}
                onClick={() => continueAfterRiddle(`/team/${teamCode}/accuse`)}
                className="btn-oxblood font-chrome uppercase text-sm py-3 rounded-sm"
              >
                {continuing ? "…" : "Proceed to the Accusation"}
              </button>
            )}
            {showScanner && (
              <button
                type="button"
                disabled={continuing}
                onClick={() => continueAfterRiddle(`/team/${teamCode}/scan`)}
                className="btn-gold-outline font-chrome uppercase text-sm py-3 rounded-sm"
              >
                {continuing ? "…" : "Go to Scanner"}
              </button>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {retrying && (
        <div className="paper-card rounded-sm p-3 border-l-4 border-oxblood text-sm">
          You&apos;ve been here before, and the dead end cost you time. Weigh the Marks again.
        </div>
      )}

      <div className="paper-card rounded-sm p-6">
        <p className="font-chrome text-[11px] uppercase tracking-wide text-ink/50 mb-1">{locationName}</p>
        <h1 className="font-display text-2xl font-bold mb-4">{suspectName}</h1>
        <p className="drop-cap text-[17px] leading-relaxed font-body whitespace-pre-line">{testimonyText}</p>
      </div>

      <MarksReference />

      {error && <p className="text-oxblood text-sm">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setPendingChoice("TRUTH")}
          className="btn-gold-outline font-chrome uppercase text-sm py-5 rounded-sm"
        >
          This Is Truth
        </button>
        <button
          onClick={() => setPendingChoice("LIE")}
          className="btn-oxblood font-chrome uppercase text-sm py-5 rounded-sm"
        >
          This Is a Lie
        </button>
      </div>

      <AnimatePresence>
        {pendingChoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 flex items-center justify-center p-5 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="paper-card rounded-sm p-6 max-w-sm w-full"
            >
              <p className="font-display text-lg font-bold mb-2">Lock this verdict?</p>
              <p className="text-sm text-ink/70 mb-6">
                You are declaring this testimony{" "}
                <strong>{pendingChoice === "TRUTH" ? "TRUTH" : "A LIE"}</strong>. Once submitted, it
                cannot be taken back.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPendingChoice(null)}
                  disabled={submitting}
                  className="btn-gold-outline font-chrome uppercase text-xs px-4 py-3 rounded-sm flex-1"
                >
                  Reconsider
                </button>
                <button
                  onClick={confirm}
                  disabled={submitting}
                  className="btn-oxblood font-chrome uppercase text-xs px-4 py-3 rounded-sm flex-1"
                >
                  {submitting ? "Locking…" : "Lock It In"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
