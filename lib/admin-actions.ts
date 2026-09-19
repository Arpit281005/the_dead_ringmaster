"use server";

import { prisma } from "@/lib/db";
import { requireAdmin, setAdminSession, clearAdminSession, verifyAdminSession } from "@/lib/admin-auth";
import { getGameConfig } from "@/lib/admin-team-insight";
import { grantEmittedFactsBeforeIndex, grantClearancesBeforeIndex } from "@/lib/grant-team-facts";
import { checkRateLimit } from "@/lib/rate-limit";
import { TOTAL_STORY_NODES } from "@/lib/state";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ADMIN_LOGIN_RATE = { limit: 5, windowMs: 60_000 };
const MAX_HINT = 500;
const MAX_BROADCAST = 500;

async function clientRateKey(prefix: string): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0]?.trim() : null) || h.get("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}

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
  const rate = checkRateLimit(await clientRateKey("admin-login"), ADMIN_LOGIN_RATE);
  if (!rate.allowed) {
    return { ok: false, error: "Too many attempts — wait a moment." };
  }
  const ok = await setAdminSession(password.slice(0, 200));
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
  // Grant Case Notes + clearances from tents being skipped so later tents /
  // accusation are not soft-locked or over-stocked with uncleared suspects.
  const granted = await grantEmittedFactsBeforeIndex(team.id, team.teamSeed, next);
  const clearances = await grantClearancesBeforeIndex(team.id, team.teamSeed, next);
  await prisma.team.update({
    where: { id: team.id },
    data: { currentIndex: next },
  });
  await logAction(
    "FORCE_ADVANCE",
    { from: team.currentIndex, to: next, factsGranted: granted, clearancesGranted: clearances },
    team.id
  );
  revalidatePath("/admin");
  revalidatePath(`/admin/teams/${team.teamCode}`);
  revalidatePath(`/team/${team.teamCode}`);
  revalidatePath(`/team/${team.teamCode}/board`);
  return { ok: true as const };
}

/** Fix soft-lock after a prior force-advance: grant Case Notes for tents before current. */
export async function repairTeamFacts(teamCode: string) {
  await requireAdmin();
  const team = await prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
  if (!team) return { ok: false as const, error: "Team not found." };

  const granted = await grantEmittedFactsBeforeIndex(team.id, team.teamSeed, team.currentIndex);
  const clearances = await grantClearancesBeforeIndex(team.id, team.teamSeed, team.currentIndex);
  await logAction(
    "REPAIR_FACTS",
    { currentIndex: team.currentIndex, factsGranted: granted, clearancesGranted: clearances },
    team.id
  );
  revalidatePath("/admin");
  revalidatePath(`/admin/teams/${team.teamCode}`);
  revalidatePath(`/team/${team.teamCode}`);
  revalidatePath(`/team/${team.teamCode}/board`);
  revalidatePath(`/team/${team.teamCode}/testimony`);
  return { ok: true as const, granted };
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

/** Permanently delete a team and every row tied to it. */
export async function deleteTeam(teamCode: string) {
  await requireAdmin();
  const code = teamCode.toUpperCase();
  const team = await prisma.team.findUnique({ where: { teamCode: code } });
  if (!team) return { ok: false as const, error: "Team not found." };

  const id = team.id;
  await prisma.$transaction(async (tx) => {
    await tx.adminAction.deleteMany({ where: { teamId: id } });
    await tx.securityFlag.deleteMany({ where: { teamId: id } });
    await tx.teamDevice.deleteMany({ where: { teamId: id } });
    await tx.accusation.deleteMany({ where: { teamId: id } });
    await tx.teamFact.deleteMany({ where: { teamId: id } });
    await tx.teamNote.deleteMany({ where: { teamId: id } });
    await tx.clearance.deleteMany({ where: { teamId: id } });
    await tx.verdict.deleteMany({ where: { teamId: id } });
    await tx.scan.deleteMany({ where: { teamId: id } });
    await tx.team.delete({ where: { id } });
  });

  await logAction("DELETE_TEAM", { teamCode: team.teamCode, name: team.name }, null);
  revalidatePath("/admin");
  revalidatePath(`/admin/teams/${code}`);
  revalidatePath(`/team/${code}`);
  return { ok: true as const };
}

export async function grantOrganiserHint(teamCode: string, hint: string) {
  await requireAdmin();
  const team = await prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
  if (!team) return { ok: false as const, error: "Team not found." };
  const text = hint.trim().slice(0, MAX_HINT);
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
  const text = message.trim().slice(0, MAX_BROADCAST);
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
