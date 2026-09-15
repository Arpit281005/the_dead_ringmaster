"use client";

import { useState } from "react";
import { updateTeamNote } from "@/lib/actions";

export default function SuspectCard({
  teamCode,
  suspectId,
  name,
  role,
  flavourText,
  cleared,
  clearReason,
  initialNote,
}: {
  teamCode: string;
  suspectId: string;
  name: string;
  role: string;
  flavourText: string;
  cleared: boolean;
  clearReason: string | null;
  initialNote: string;
}) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await updateTeamNote(teamCode, suspectId, note);
    setSaving(false);
  }

  return (
    <div
      className={
        "paper-card rounded-sm p-4 flex flex-col gap-2 " + (cleared ? "opacity-70" : "")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className={
              "font-display font-bold text-lg " + (cleared ? "line-through decoration-oxblood decoration-2" : "")
            }
          >
            {name}
          </p>
          <p className="text-xs font-chrome uppercase tracking-wide text-ink/50">{role}</p>
        </div>
        {cleared && (
          <span className="ink-stamp font-chrome text-[10px] uppercase px-2 py-0.5 rounded-sm shrink-0">
            Cleared
          </span>
        )}
      </div>

      <p className="text-sm italic text-ink/70">{flavourText}</p>

      {cleared && clearReason && <p className="text-xs text-teal">{clearReason}</p>}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={save}
        placeholder="Your notes…"
        rows={2}
        className="mt-1 w-full border border-ink/20 bg-parchment/60 rounded-sm px-2 py-1.5 text-sm focus:outline-none focus:border-oxblood resize-none"
      />
      {saving && <p className="text-[10px] text-ink/40 font-chrome uppercase">Saving…</p>}
    </div>
  );
}
