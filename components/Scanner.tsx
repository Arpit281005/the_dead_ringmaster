"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scanNode } from "@/lib/actions";

type ScanOutcome =
  | { kind: "story" }
  | { kind: "decoy"; passage: string; locationName: string }
  | { kind: "invalid"; reason: string }
  | { kind: "error"; message: string };

export default function Scanner({ teamCode }: { teamCode: string }) {
  const router = useRouter();
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const html5QrRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [outcome, setOutcome] = useState<ScanOutcome | null>(null);
  const [busy, setBusy] = useState(false);
  const submittingRef = useRef(false);
  const runningRef = useRef(false);

  async function handleToken(token: string) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setBusy(true);
    setOutcome(null);
    try {
      const result = await scanNode(teamCode, token);
      if (!result.ok) {
        setOutcome({ kind: "error", message: result.error });
        return;
      }
      if (!result.data.valid) {
        setOutcome({ kind: "invalid", reason: result.data.reason });
        return;
      }
      if (result.data.kind === "decoy") {
        setOutcome({ kind: "decoy", passage: result.data.passage, locationName: result.data.locationName });
        return;
      }
      setOutcome({ kind: "story" });
      router.push(`/team/${teamCode}/testimony`);
    } finally {
      setBusy(false);
      submittingRef.current = false;
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled || !scannerRef.current) return;
        const instance = new Html5Qrcode(scannerRef.current.id);
        html5QrRef.current = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            handleToken(decodedText.trim());
          },
          () => {}
        );
        if (cancelled) {
          // Unmounted while start() was in flight; stop what we just started.
          instance.stop().catch(() => {}).finally(() => instance.clear());
          return;
        }
        runningRef.current = true;
      } catch {
        if (!cancelled) setCameraError("Camera unavailable — use the code below.");
      }
    }

    start();
    return () => {
      cancelled = true;
      const inst = html5QrRef.current;
      if (inst && runningRef.current) {
        runningRef.current = false;
        try {
          inst
            .stop()
            .catch(() => {})
            .finally(() => inst.clear());
        } catch {
          // stop() can throw synchronously if the camera never fully started.
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="paper-card rounded-sm p-3">
        {!cameraError ? (
          <div id="qr-scan-region" ref={scannerRef} className="w-full aspect-square rounded-sm overflow-hidden bg-ink" />
        ) : (
          <div className="w-full aspect-[3/1] rounded-sm bg-ink/5 flex items-center justify-center text-center text-sm text-ink/60 p-4">
            {cameraError}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manualToken.trim()) handleToken(manualToken.trim());
        }}
        className="paper-card rounded-sm p-4 flex flex-col gap-3"
      >
        <label className="text-sm font-chrome uppercase tracking-wide text-ink/60">
          Or type the code from the tent
        </label>
        <div className="flex gap-2">
          <input
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            className="flex-1 border border-ink/30 bg-parchment px-3 py-3 rounded-sm font-chrome tracking-wide focus:outline-none focus:border-oxblood"
            placeholder="Paste signed tent code"
            autoCapitalize="off"
            autoCorrect="off"
          />
          <button
            type="submit"
            disabled={busy || !manualToken.trim()}
            className="btn-oxblood font-chrome uppercase text-xs px-4 rounded-sm"
          >
            Enter
          </button>
        </div>
      </form>

      {outcome?.kind === "invalid" && (
        <div className="paper-card rounded-sm p-4 border-l-4 border-oxblood">
          <p className="text-sm">{outcome.reason}</p>
        </div>
      )}
      {outcome?.kind === "error" && (
        <div className="paper-card rounded-sm p-4 border-l-4 border-oxblood">
          <p className="text-sm">{outcome.message}</p>
        </div>
      )}
      {outcome?.kind === "decoy" && (
        <div className="paper-card rounded-sm p-5 border-l-4 border-oxblood flex flex-col gap-3">
          <p className="font-display font-bold">{outcome.locationName}</p>
          <p className="text-sm italic leading-relaxed">{outcome.passage}</p>
          <p className="text-xs text-oxblood font-chrome uppercase tracking-wide">
            +5 minute penalty applied
          </p>
          <button
            onClick={() => router.push(`/team/${teamCode}/testimony`)}
            className="btn-oxblood font-chrome uppercase text-xs px-4 py-3 rounded-sm self-start"
          >
            Return and Reconsider
          </button>
        </div>
      )}
    </div>
  );
}
