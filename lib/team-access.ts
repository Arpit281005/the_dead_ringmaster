import { prisma } from "@/lib/db";

/** Public team fields safe for RSC props / client — never includes teamSeed, contact, members. */
export type TeamPublic = {
  id: string;
  teamCode: string;
  name: string;
  status: string;
  currentIndex: number;
  startedAt: Date;
  finishedAt: Date | null;
  penaltySeconds: number;
};

export function toTeamPublic(team: {
  id: string;
  teamCode: string;
  name: string;
  status: string;
  currentIndex: number;
  startedAt: Date;
  finishedAt: Date | null;
  penaltySeconds: number;
}): TeamPublic {
  return {
    id: team.id,
    teamCode: team.teamCode,
    name: team.name,
    status: team.status,
    currentIndex: team.currentIndex,
    startedAt: team.startedAt,
    finishedAt: team.finishedAt,
    penaltySeconds: team.penaltySeconds,
  };
}

export async function requireTeamByCode(teamCode: string) {
  const team = await prisma.team.findUnique({
    where: { teamCode: teamCode.toUpperCase() },
  });
  if (!team) return null;
  return team;
}

/** Guard: row belongs to the authenticated team. */
export function assertSameTeam(rowTeamId: string, teamId: string): boolean {
  return rowTeamId === teamId;
}
