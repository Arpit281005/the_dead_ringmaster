import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamByCode } from "@/lib/state";
import { MARKS, CASE_FACTS, PREMISE } from "@/lib/content";

export default async function RulebookPage({
  params,
}: {
  params: Promise<{ teamCode: string }>;
}) {
  const { teamCode } = await params;
  const team = await getTeamByCode(teamCode);
  if (!team) notFound();

  return (
    <main className="flex-1 px-5 py-10 max-w-2xl mx-auto w-full">
      <p className="font-chrome text-xs tracking-[0.3em] text-oxblood uppercase mb-1">
        Team {team.teamCode} registered
      </p>
      <h1 className="font-display text-3xl font-black mb-6">The Case File</h1>

      <p className="italic text-ink/80 mb-8 leading-relaxed">{PREMISE}</p>

      <h2 className="font-display text-xl font-bold mb-3">The Four Marks</h2>
      <div className="flex flex-col gap-3 mb-8">
        {MARKS.map((m) => (
          <div key={m.title} className="paper-card rounded-sm p-4">
            <p className="font-chrome text-xs uppercase tracking-wide text-oxblood mb-1">{m.title}</p>
            <p className="text-sm leading-relaxed">{m.body}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl font-bold mb-3">Fixed Facts</h2>
      <ul className="paper-card rounded-sm p-4 mb-8 flex flex-col gap-2 text-sm">
        {CASE_FACTS.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-gold">✦</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="paper-card rounded-sm p-4 mb-10 text-sm leading-relaxed">
        At every tent: read the testimony, weigh it against the Marks, then declare{" "}
        <strong>THIS IS TRUTH</strong> or <strong>THIS IS A LIE</strong>. Judge correctly and the
        tent&apos;s riddle points you onward. Judge wrong, and you&apos;ll find a dead end instead —
        costly, but not fatal. Your verdict locks the moment you submit it.
      </div>

      <Link
        href={`/team/${team.teamCode}`}
        className="btn-oxblood font-chrome uppercase text-sm py-4 rounded-sm shadow-md block text-center"
      >
        Begin the Hunt
      </Link>
    </main>
  );
}
