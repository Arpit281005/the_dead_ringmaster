"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  acknowledgeSecurityFlag,
  forceAdvanceTeam,
  repairTeamFacts,
  voidTeamPenalty,
  deleteTeam,
  grantOrganiserHint,
  clearOrganiserHint,
  toggleGlobalPause,
  setBroadcast,
  adminLogout,
} from "@/lib/admin-actions";

export function AcknowledgeFlagButton({ flagId }: { flagId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => { void acknowledgeSecurityFlag(flagId); })}
      className="btn-gold-outline font-chrome uppercase text-[10px] px-2 py-1 rounded-sm"
    >
      {pending ? "…" : "Ack"}
    </button>
  );
}

export function PauseResumeButton({ isPaused }: { isPaused: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(() => {
          void toggleGlobalPause();
        })
      }
      className="btn-oxblood font-chrome uppercase text-xs px-3 py-2 rounded-sm"
    >
      {pending ? "…" : isPaused ? "Resume clocks" : "Pause all"}
    </button>
  );
}

export function BroadcastForm({ initial }: { initial: string }) {
  const [msg, setMsg] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <form
      className="flex gap-2 flex-1 min-w-0"
      onSubmit={(e) => {
        e.preventDefault();
        start(() => {
          void setBroadcast(msg);
        });
      }}
    >
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Broadcast to all teams…"
        className="flex-1 border border-ink/30 bg-parchment px-2 py-2 rounded-sm text-sm min-w-0"
      />
      <button
        type="submit"
        disabled={pending}
        className="btn-gold-outline font-chrome uppercase text-xs px-3 py-2 rounded-sm shrink-0"
      >
        Send
      </button>
    </form>
  );
}

export function TeamMutationPanel({
  teamCode,
  organiserHint,
}: {
  teamCode: string;
  organiserHint: string | null;
}) {
  const router = useRouter();
  const [hint, setHint] = useState(organiserHint ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pending, start] = useTransition();

  const canDelete = confirmCode.trim().toUpperCase() === teamCode.toUpperCase();

  return (
    <div className="flex flex-col gap-3 paper-card rounded-sm p-4">
      <p className="font-chrome text-[10px] uppercase tracking-wide text-ink/50">Organiser tools</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className="btn-oxblood font-chrome uppercase text-xs px-3 py-2 rounded-sm"
          onClick={() =>
            start(async () => {
              const r = await forceAdvanceTeam(teamCode);
              setMsg(r.ok ? "Advanced one tent." : r.error);
            })
          }
        >
          Force advance
        </button>
        <button
          type="button"
          disabled={pending}
          className="btn-gold-outline font-chrome uppercase text-xs px-3 py-2 rounded-sm"
          onClick={() =>
            start(async () => {
              const r = await repairTeamFacts(teamCode);
              setMsg(
                r.ok
                  ? r.granted.length
                    ? `Case Notes repaired (${r.granted.join(", ")}).`
                    : "No missing Case Notes to grant."
                  : r.error
              );
            })
          }
        >
          Repair Case Notes
        </button>
        <button
          type="button"
          disabled={pending}
          className="btn-gold-outline font-chrome uppercase text-xs px-3 py-2 rounded-sm"
          onClick={() =>
            start(async () => {
              const r = await voidTeamPenalty(teamCode);
              setMsg(r.ok ? "Penalties voided." : r.error);
            })
          }
        >
          Void penalties
        </button>
        {organiserHint && (
          <button
            type="button"
            disabled={pending}
            className="btn-gold-outline font-chrome uppercase text-xs px-3 py-2 rounded-sm"
            onClick={() =>
              start(async () => {
                await clearOrganiserHint(teamCode);
                setHint("");
                setMsg("Hint cleared.");
              })
            }
          >
            Clear hint
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          className="btn-gold-outline font-chrome uppercase text-xs px-3 py-2 rounded-sm border-oxblood text-oxblood"
          onClick={() => {
            setShowDeleteConfirm(true);
            setConfirmCode("");
            setMsg(null);
          }}
        >
          Delete team
        </button>
      </div>
      <div className="flex gap-2">
        <input
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="Grant hint (shown on Midway)"
          className="flex-1 border border-ink/30 bg-parchment px-2 py-2 rounded-sm text-sm"
        />
        <button
          type="button"
          disabled={pending || !hint.trim()}
          className="btn-oxblood font-chrome uppercase text-xs px-3 py-2 rounded-sm"
          onClick={() =>
            start(async () => {
              const r = await grantOrganiserHint(teamCode, hint);
              setMsg(r.ok ? "Hint granted." : r.error);
            })
          }
        >
          Grant
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="border border-oxblood/40 bg-oxblood/5 rounded-sm p-3 flex flex-col gap-2">
          <p className="text-sm text-oxblood leading-relaxed">
            Permanently delete team <strong>{teamCode}</strong> and all scans, verdicts, Case Notes,
            clearances, devices, flags, and accusation. This cannot be undone.
          </p>
          <label className="text-xs text-ink/60">
            Type the team code to confirm
            <input
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              className="mt-1 w-full border border-ink/30 bg-parchment px-2 py-2 rounded-sm text-sm font-chrome tracking-wide uppercase"
              placeholder={teamCode}
              autoCapitalize="characters"
              autoCorrect="off"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              className="btn-gold-outline font-chrome uppercase text-xs px-3 py-2 rounded-sm"
              onClick={() => {
                setShowDeleteConfirm(false);
                setConfirmCode("");
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending || !canDelete}
              className="btn-oxblood font-chrome uppercase text-xs px-3 py-2 rounded-sm"
              onClick={() =>
                start(async () => {
                  const r = await deleteTeam(teamCode);
                  if (!r.ok) {
                    setMsg(r.error);
                    return;
                  }
                  router.push("/admin");
                  router.refresh();
                })
              }
            >
              {pending ? "Deleting…" : "Delete forever"}
            </button>
          </div>
        </div>
      )}

      {msg && <p className="text-sm text-ink/70">{msg}</p>}
    </div>
  );
}

export function LogoutButton() {
  return (
    <form action={adminLogout}>
      <button type="submit" className="text-xs font-chrome uppercase text-ink/50 hover:text-oxblood">
        Log out
      </button>
    </form>
  );
}
