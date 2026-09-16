"use server";

import { prisma } from "@/lib/db";
import { requireAdmin, setAdminSession, clearAdminSession, verifyAdminSession } from "@/lib/admin-auth";
import { getGameConfig } from "@/lib/admin-team-insight";
import { TOTAL_STORY_NODES } from "@/lib/state";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function logAction(
  actionType: string,
  payload: Record<string, unknown>,
  teamId?: string | null
) {
  await prisma.adminAction.create({
    data: {
      actionType,
      payload: JSON.stringify(payload),
      teamId: teamId ?? null,
      adminLabel: "organiser",
    },
  });
}

export async function adminLogin(password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const ok = await setAdminSession(password);
  if (!ok) return { ok: false, error: "Incorrect password." };
  return { ok: true };
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function acknowledgeSecurityFlag(flagId: string) {
  await requireAdmin();
  await prisma.securityFlag.update({
    where: { id: flagId },
    data: { acknowledgedAt: new Date() },
  });
  revalidatePath("/admin");
}

export async function forceAdvanceTeam(teamCode: string) {
  await requireAdmin();
  const team = await prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
  if (!team) return { ok: false as const, error: "Team not found." };
  if (team.status === "FINISHED") return { ok: false as const, error: "Team already finished." };

  const next = Math.min(team.currentIndex + 1, TOTAL_STORY_NODES);
  await prisma.team.update({
    where: { id: team.id },
    data: { currentIndex: next },
  });
  await logAction("FORCE_ADVANCE", { from: team.currentIndex, to: next }, team.id);
  revalidatePath("/admin");
  revalidatePath(`/admin/teams/${team.teamCode}`);
  return { ok: true as const };
}

export async function voidTeamPenalty(teamCode: string) {
  await requireAdmin();
  const team = await prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
  if (!team) return { ok: false as const, error: "Team not found." };
  const prior = team.penaltySeconds;
  await prisma.team.update({
    where: { id: team.id },
    data: { penaltySeconds: 0 },
  });
  await logAction("VOID_PENALTY", { priorPenaltySeconds: prior }, team.id);
  revalidatePath("/admin");
  revalidatePath(`/admin/teams/${team.teamCode}`);
  return { ok: true as const };
}

export async function grantOrganiserHint(teamCode: string, hint: string) {
  await requireAdmin();
  const team = await prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
  if (!team) return { ok: false as const, error: "Team not found." };
  const text = hint.trim();
  if (!text) return { ok: false as const, error: "Hint text required." };
  await prisma.team.update({
    where: { id: team.id },
    data: { organiserHint: text },
  });
  await logAction("GRANT_HINT", { hint: text }, team.id);
  revalidatePath("/admin");
  revalidatePath(`/admin/teams/${team.teamCode}`);
  revalidatePath(`/team/${team.teamCode}`);
  return { ok: true as const };
}

export async function clearOrganiserHint(teamCode: string) {
  await requireAdmin();
  const team = await prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
  if (!team) return { ok: false as const, error: "Team not found." };
  await prisma.team.update({
    where: { id: team.id },
    data: { organiserHint: null },
  });
  await logAction("CLEAR_HINT", {}, team.id);
  revalidatePath(`/team/${team.teamCode}`);
  revalidatePath(`/admin/teams/${team.teamCode}`);
  return { ok: true as const };
}

export async function toggleGlobalPause() {
  await requireAdmin();
  const config = await getGameConfig();
  if (config.isPaused && config.pausedAt) {
    const pauseSeconds = Math.max(
      0,
      Math.floor((Date.now() - config.pausedAt.getTime()) / 1000)
    );
    await prisma.team.updateMany({
      where: { status: "ACTIVE" },
      data: { pausedSeconds: { increment: pauseSeconds } },
    });
    await prisma.gameConfig.update({
      where: { id: "singleton" },
      data: { isPaused: false, pausedAt: null },
    });
    await logAction("RESUME", { pauseSecondsAdded: pauseSeconds });
  } else {
    await prisma.gameConfig.update({
      where: { id: "singleton" },
      data: { isPaused: true, pausedAt: new Date() },
    });
    await logAction("PAUSE", {});
  }
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true as const };
}

export async function setBroadcast(message: string) {
  await requireAdmin();
  const text = message.trim();
  await prisma.gameConfig.update({
    where: { id: "singleton" },
    data: {
      broadcastMessage: text || null,
      broadcastAt: text ? new Date() : null,
    },
  });
  await logAction("BROADCAST", { message: text || null });
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true as const };
}

export async function ensureAdminOrRedirect() {
  if (!(await verifyAdminSession())) redirect("/admin/login");
}
