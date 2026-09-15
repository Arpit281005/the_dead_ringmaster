"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAccusation } from "@/lib/actions";

type Suspect = { id: string; name: string; role: string; flavourText: string };

export default function AccusationForm({
  teamCode,
  suspects,
}: {
  teamCode: string;
  suspects: Suspect[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(suspects.length === 1 ? suspects[0].id : null);
  const [reasoning, setReasoning] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    const res = await submitAccusation(teamCode, selected, reasoning);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      setConfirmOpen(false);
      return;
    }
    router.push(`/team/${teamCode}/reveal`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3">
        {suspects.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={
              "paper-card rounded-sm p-4 text-left transition " +
              (selected === s.id ? "border-2 border-oxblood" : "")
            }
          >
            <p className="font-display font-bold text-lg">{s.name}</p>
            <p className="text-xs font-chrome uppercase tracking-wide text-ink/50">{s.role}</p>
            <p className="text-sm italic text-ink/70 mt-1">{s.flavourText}</p>
          </button>
        ))}
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Your reasoning, in one sentence
        <textarea
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          rows={3}
          className="border border-ink/30 bg-parchment px-3 py-2 rounded-sm focus:outline-none focus:border-oxblood"
          placeholder="Because…"
        />
      </label>

      {error && <p className="text-oxblood text-sm">{error}</p>}

      <button
        onClick={() => setConfirmOpen(true)}
        disabled={!selected || !reasoning.trim()}
        className="btn-oxblood font-chrome uppercase text-sm py-4 rounded-sm shadow-md"
      >
        Name the Murderer
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 bg-ink/60 flex items-center justify-center p-5 z-50">
          <div className="paper-card rounded-sm p-6 max-w-sm w-full">
            <p className="font-display text-lg font-bold mb-2">This locks the clock.</p>
            <p className="text-sm text-ink/70 mb-6">
              Once you accuse, the hunt ends for your team. There is no reconsidering.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="btn-gold-outline font-chrome uppercase text-xs px-4 py-3 rounded-sm flex-1"
              >
                Wait
              </button>
              <button
                onClick={confirm}
                disabled={submitting}
                className="btn-oxblood font-chrome uppercase text-xs px-4 py-3 rounded-sm flex-1"
              >
                {submitting ? "Locking…" : "Accuse"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
