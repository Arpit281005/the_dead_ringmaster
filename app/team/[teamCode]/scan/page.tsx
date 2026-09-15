import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamByCode } from "@/lib/state";
import Scanner from "@/components/Scanner";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ teamCode: string }>;
}) {
  const { teamCode } = await params;
  const team = await getTeamByCode(teamCode);
  if (!team) notFound();

  return (
    <main className="flex-1 px-5 py-8 max-w-md mx-auto w-full">
      <Link href={`/team/${team.teamCode}`} className="text-xs font-chrome uppercase tracking-wide text-ink/50">
        ← Midway
      </Link>
      <h1 className="font-display text-2xl font-black mt-2 mb-6">Scan the Tent</h1>
      <Scanner teamCode={team.teamCode} />
    </main>
  );
}
