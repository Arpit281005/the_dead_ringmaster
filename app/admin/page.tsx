import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getGameConfig, listTeamsForAdmin } from "@/lib/admin-team-insight";
import { prisma } from "@/lib/db";
import { formatDuration } from "@/lib/format";
import {
  AcknowledgeFlagButton,
  BroadcastForm,
  LogoutButton,
  PauseResumeButton,
} from "@/components/admin/AdminControls";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const config = await getGameConfig();
  const teams = await listTeamsForAdmin();
  const flags = await prisma.securityFlag.findMany({
    where: { acknowledgedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      team: { select: { teamCode: true, name: true } },
      node: { select: { locationName: true, nodeSlot: true } },
    },
  });

  return (
    <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black">{config.eventName}</h1>
          <p className="text-sm text-ink/60">Organiser console</p>
          {config.isPaused && (
            <p className="text-oxblood text-sm font-chrome uppercase mt-1">Clocks paused</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PauseResumeButton isPaused={config.isPaused} />
          <Link href="/admin/print" className="btn-gold-outline font-chrome uppercase text-xs px-3 py-2 rounded-sm">
            Print QRs
          </Link>
          <a href="/admin/export" className="btn-gold-outline font-chrome uppercase text-xs px-3 py-2 rounded-sm">
            CSV
          </a>
          <LogoutButton />
        </div>
      </header>

      <section className="flex flex-col gap-2">
        <p className="font-chrome text-[10px] uppercase tracking-wide text-ink/50">Broadcast</p>
        <BroadcastForm initial={config.broadcastMessage ?? ""} />
      </section>

      <section>
        <h2 className="font-display text-xl font-bold mb-3">Live teams</h2>
        <div className="overflow-x-auto border border-ink/15 rounded-sm">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 font-chrome text-[10px] uppercase text-ink/50">
              <tr>
                <th className="text-left p-2">Code</th>
                <th className="text-left p-2">Team</th>
                <th className="text-left p-2">Where</th>
                <th className="text-left p-2">Act</th>
                <th className="text-right p-2">Time</th>
                <th className="text-right p-2">Pen.</th>
                <th className="text-center p-2">Stuck</th>
                <th className="text-center p-2">Flags</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t) => (
                <tr key={t.id} className="border-t border-ink/10">
                  <td className="p-2">
                    <Link
                      href={`/admin/teams/${t.teamCode}`}
                      className="font-chrome text-oxblood underline-offset-2 hover:underline"
                    >
                      {t.teamCode}
                    </Link>
                  </td>
                  <td className="p-2 font-display font-semibold">{t.name}</td>
                  <td className="p-2">{t.phaseLabel}</td>
                  <td className="p-2">{t.act}</td>
                  <td className="p-2 text-right tabular-nums">{formatDuration(t.elapsedSeconds)}</td>
                  <td className="p-2 text-right tabular-nums">{formatDuration(t.penaltySeconds)}</td>
                  <td className="p-2 text-center">{t.stuck ? "⚠" : "—"}</td>
                  <td className="p-2 text-center">{t.openFlagCount || "—"}</td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-ink/50 text-center">
                    No teams registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-l-4 border-amber-700/80 bg-amber-50/40 pl-4 py-3 rounded-sm">
        <h2 className="font-display text-xl font-bold mb-1">Security flags</h2>
        <p className="text-xs text-ink/60 mb-3">
          Review only — device/IP mismatch and fast solves. Not automatic penalties.
        </p>
        {flags.length === 0 ? (
          <p className="text-sm text-ink/50">No open flags.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {flags.map((f) => (
              <li
                key={f.id}
                className="flex flex-wrap items-start justify-between gap-2 paper-card rounded-sm p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-chrome text-[10px] uppercase text-ink/50">
                    {f.kind} · {f.team.teamCode} · {f.createdAt.toISOString()}
                  </p>
                  <p className="font-semibold">{f.team.name}</p>
                  {f.node && (
                    <p className="text-xs text-ink/60">
                      {f.node.nodeSlot} — {f.node.locationName}
                    </p>
                  )}
                  <pre className="mt-1 text-[11px] whitespace-pre-wrap break-all text-ink/70">{f.detail}</pre>
                </div>
                <AcknowledgeFlagButton flagId={f.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
