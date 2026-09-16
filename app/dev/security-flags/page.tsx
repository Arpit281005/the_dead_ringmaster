import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DevSecurityFlagsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const flags = await prisma.securityFlag.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      team: { select: { teamCode: true, name: true } },
      node: { select: { locationName: true, nodeSlot: true } },
    },
  });

  return (
    <main className="flex-1 px-5 py-8 max-w-3xl mx-auto w-full">
      <h1 className="font-display text-2xl font-black mb-1">Security Flags</h1>
      <p className="text-sm text-ink/60 mb-8">
        Dev / organiser review only — soft signals (unknown device/IP, fast resolves). Never
        auto-penalize from this list. Hidden in production.
      </p>
      {flags.length === 0 ? (
        <p className="text-sm text-ink/50">No flags yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {flags.map((f) => (
            <li key={f.id} className="paper-card rounded-sm p-4 text-sm">
              <p className="font-chrome text-[10px] uppercase tracking-wide text-ink/50">
                {f.kind} · {f.team.teamCode} · {f.createdAt.toISOString()}
              </p>
              <p className="font-display font-bold">{f.team.name}</p>
              {f.node && (
                <p className="text-xs text-ink/60">
                  Node {f.node.nodeSlot} — {f.node.locationName}
                </p>
              )}
              <pre className="mt-2 text-[11px] bg-ink/5 p-2 rounded-sm overflow-x-auto whitespace-pre-wrap">
                {f.detail}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
