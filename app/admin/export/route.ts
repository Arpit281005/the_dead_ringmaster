import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvEscape(v: string | number | boolean | null | undefined): string {
  let s = v === null || v === undefined ? "" : String(v);
  // Neutralize spreadsheet formula injection (=, +, -, @, tab, CR)
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    orderBy: { startedAt: "asc" },
    include: {
      facts: { select: { factKey: true, cipherKey: true } },
      accusation: true,
      _count: {
        select: {
          securityFlags: true,
        },
      },
    },
  });

  const header = [
    "teamCode",
    "name",
    "status",
    "currentIndex",
    "penaltySeconds",
    "pausedSeconds",
    "startedAt",
    "finishedAt",
    "factKeys",
    "accusationSuspectCorrect",
    "accusationMethodCorrect",
    "accusationFactCorrect",
    "accusationWasCorrect",
    "securityFlagCount",
    "seedPrefix",
  ];

  const rows = teams.map((t) =>
    [
      t.teamCode,
      t.name,
      t.status,
      t.currentIndex,
      t.penaltySeconds,
      t.pausedSeconds,
      t.startedAt.toISOString(),
      t.finishedAt?.toISOString() ?? "",
      t.facts.map((f) => f.factKey).join("|"),
      t.accusation?.suspectCorrect ?? "",
      t.accusation?.methodCorrect ?? "",
      t.accusation?.factCorrect ?? "",
      t.accusation?.wasCorrect ?? "",
      t._count.securityFlags,
      t.teamSeed.slice(0, 12),
    ]
      .map(csvEscape)
      .join(",")
  );

  const body = [header.join(","), ...rows].join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="carnival-results.csv"',
    },
  });
}
