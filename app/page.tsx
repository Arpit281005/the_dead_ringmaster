"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTeam, joinTeam } from "@/lib/actions";

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [name, setName] = useState("");
  const [members, setMembers] = useState(["", "", "", ""]);
  const [contact, setContact] = useState("");
  const [joinCode, setJoinCode] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await createTeam({ name, members, contact });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/team/${result.data.teamCode}/rulebook`);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const result = await joinTeam(joinCode);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/team/${result.data.teamCode}`);
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="font-chrome text-xs tracking-[0.3em] text-oxblood uppercase mb-2">
            Aahladh presents
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-ink leading-tight">
            The Carnival
            <br />
            of Lies
          </h1>
          <p className="mt-4 text-ink/70 italic">
            A ringmaster is dead. Seven suspects remain. Trust nothing but the Marks.
          </p>
        </div>

        {mode === "choose" && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMode("create")}
              className="btn-oxblood font-chrome uppercase text-sm py-4 rounded-sm shadow-md"
            >
              Register a New Team
            </button>
            <button
              onClick={() => setMode("join")}
              className="btn-gold-outline font-chrome uppercase text-sm py-4 rounded-sm"
            >
              Join With a Team Code
            </button>
          </div>
        )}

        {mode === "create" && (
          <form onSubmit={handleCreate} className="paper-card rounded-sm p-6 flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold">Register Your Team</h2>
            <label className="flex flex-col gap-1 text-sm">
              Team name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-ink/30 bg-parchment px-3 py-2 rounded-sm focus:outline-none focus:border-oxblood"
                placeholder="e.g. The Velvet Ravens"
              />
            </label>
            <div className="flex flex-col gap-1 text-sm">
              Members (up to 4)
              {members.map((m, i) => (
                <input
                  key={i}
                  value={m}
                  onChange={(e) => {
                    const next = [...members];
                    next[i] = e.target.value;
                    setMembers(next);
                  }}
                  className="border border-ink/30 bg-parchment px-3 py-2 rounded-sm focus:outline-none focus:border-oxblood"
                  placeholder={`Member ${i + 1}`}
                />
              ))}
            </div>
            <label className="flex flex-col gap-1 text-sm">
              Contact number
              <input
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="border border-ink/30 bg-parchment px-3 py-2 rounded-sm focus:outline-none focus:border-oxblood"
                placeholder="For the volunteers, if you go quiet"
              />
            </label>
            {error && <p className="text-oxblood text-sm">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode("choose")}
                className="btn-gold-outline font-chrome uppercase text-xs px-4 py-3 rounded-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={pending}
                className="btn-oxblood font-chrome uppercase text-xs px-4 py-3 rounded-sm flex-1"
              >
                {pending ? "Registering…" : "Create Team"}
              </button>
            </div>
          </form>
        )}

        {mode === "join" && (
          <form onSubmit={handleJoin} className="paper-card rounded-sm p-6 flex flex-col gap-4">
            <h2 className="font-display text-xl font-bold">Join Your Team</h2>
            <label className="flex flex-col gap-1 text-sm">
              Team code
              <input
                required
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="border border-ink/30 bg-parchment px-3 py-2 rounded-sm font-chrome tracking-widest focus:outline-none focus:border-oxblood"
                placeholder="VEX-4417"
              />
            </label>
            {error && <p className="text-oxblood text-sm">{error}</p>}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode("choose")}
                className="btn-gold-outline font-chrome uppercase text-xs px-4 py-3 rounded-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={pending}
                className="btn-oxblood font-chrome uppercase text-xs px-4 py-3 rounded-sm flex-1"
              >
                {pending ? "Joining…" : "Join Team"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
