"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { submitVerdict } from "@/lib/actions";
import MarksReference from "@/components/MarksReference";

type Choice = "TRUTH" | "LIE";

type Result = {
  wasCorrect: boolean;
  riddle: string;
  clearedSuspectName: string | null;
  advanced: boolean;
  huntComplete: boolean;
};

export default function VerdictPanel({
  teamCode,
  nodeId,
  suspectName,
  locationName,
  testimonyText,
  retrying,
}: {
  teamCode: string;
  nodeId: string;
  suspectName: string;
  locationName: string;
  testimonyText: string;
  retrying: boolean;
}) {
  const router = useRouter();
  const [pendingChoice, setPendingChoice] = useState<Choice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
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
    setPendingChoice(null);
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
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
            {result.advanced ? "Accepted" : "Misjudged"}
          </motion.span>
        </div>

        <div>
          <p className="font-chrome text-xs uppercase tracking-wide text-ink/50 mb-1">The Riddle Reads</p>
          <p className="font-display text-lg leading-snug">{result.riddle}</p>
        </div>

        {result.clearedSuspectName && (
          <p className="text-sm text-teal">
            <strong>{result.clearedSuspectName}</strong> is cleared.
          </p>
        )}

        {!result.advanced && (
          <p className="text-sm text-oxblood leading-relaxed">
            Something doesn&apos;t sit right. Follow the riddle — if it leads to a dead end, scan
            what you find there, then return and weigh the testimony again.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {result.advanced && !result.huntComplete && (
            <button
              onClick={() => router.push(`/team/${teamCode}`)}
              className="btn-oxblood font-chrome uppercase text-sm py-3 rounded-sm"
            >
              Return to the Midway
            </button>
          )}
          {result.advanced && result.huntComplete && (
            <button
              onClick={() => router.push(`/team/${teamCode}/accuse`)}
              className="btn-oxblood font-chrome uppercase text-sm py-3 rounded-sm"
            >
              Proceed to the Accusation
            </button>
          )}
          {!result.advanced && (
            <button
              onClick={() => router.push(`/team/${teamCode}/scan`)}
              className="btn-gold-outline font-chrome uppercase text-sm py-3 rounded-sm"
            >
              Go to Scanner
            </button>
          )}
        </div>
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
