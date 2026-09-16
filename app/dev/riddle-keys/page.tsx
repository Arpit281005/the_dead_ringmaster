import { notFound } from "next/navigation";
import { ADMIN_RIDDLE_KEYS } from "@/lib/node-content/admin-riddle-keys";

export const dynamic = "force-dynamic";

export default function DevRiddleKeysPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="flex-1 px-5 py-8 max-w-3xl mx-auto w-full">
      <h1 className="font-display text-2xl font-black mb-1">Admin Riddle Keys</h1>
      <p className="text-sm text-ink/60 mb-2">
        Development / volunteer cheat sheet only — hidden in production. Never share with players
        during the hunt.
      </p>
      <p className="text-xs text-ink/50 mb-8 font-chrome uppercase tracking-wide">
        Encode: plaintext → Caesar(key) → mirror → stage1 · Decode: reverse
      </p>
      <div className="flex flex-col gap-4">
        {ADMIN_RIDDLE_KEYS.map((row) => (
          <div key={row.sequenceIndex} className="paper-card rounded-sm p-4">
            <p className="font-chrome text-[10px] uppercase tracking-wide text-ink/50">
              Tent {row.sequenceIndex + 1} · Act {row.act}
            </p>
            <p className="font-display font-bold text-lg">{row.name}</p>
            <p className="text-sm mt-2 leading-relaxed">{row.steps}</p>
            {row.key && (
              <p className="mt-2 font-chrome text-xs uppercase">
                Key: <code className="bg-ink/5 px-2 py-0.5 rounded-sm">{row.key}</code>{" "}
                <span className="text-ink/50">({row.keySource})</span>
              </p>
            )}
            <p className="text-xs text-ink/50 mt-1">
              Mirror pool: {row.mirrorStyles.join(", ")}
            </p>
            {row.example && <p className="text-xs text-ink/60 mt-2 italic">{row.example}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
