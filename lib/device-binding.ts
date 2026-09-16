import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/db";
import { customAlphabet } from "nanoid";

const DEVICE_COOKIE = "carnival_device";
const deviceIdAlphabet = customAlphabet("abcdefghjkmnpqrstuvwxyz23456789", 24);

export type ClientContext = {
  deviceId: string;
  ip: string | null;
  userAgent: string | null;
};

/** Ensure a stable device cookie; read IP / UA for soft association. */
export async function ensureClientContext(): Promise<ClientContext> {
  const jar = await cookies();
  let deviceId = jar.get(DEVICE_COOKIE)?.value;
  if (!deviceId || deviceId.length < 8) {
    deviceId = deviceIdAlphabet();
    jar.set(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === "production",
    });
  }

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip =
    (forwarded ? forwarded.split(",")[0]?.trim() : null) ||
    h.get("x-real-ip") ||
    null;
  const userAgent = h.get("user-agent");

  return { deviceId, ip, userAgent };
}

/**
 * Upsert device for team. Soft-flags UNKNOWN_DEVICE / UNKNOWN_IP without blocking.
 */
export async function touchTeamDevice(teamId: string, ctx: ClientContext): Promise<void> {
  const existing = await prisma.teamDevice.findUnique({
    where: { teamId_deviceId: { teamId, deviceId: ctx.deviceId } },
  });

  if (!existing) {
    const anyDevice = await prisma.teamDevice.findFirst({ where: { teamId } });
    if (anyDevice) {
      await prisma.securityFlag.create({
        data: {
          teamId,
          kind: "UNKNOWN_DEVICE",
          detail: JSON.stringify({
            deviceId: ctx.deviceId,
            ip: ctx.ip,
            userAgent: ctx.userAgent,
            note: "Scan/action from a device not previously joined to this team",
          }),
        },
      });
    }
    await prisma.teamDevice.create({
      data: {
        teamId,
        deviceId: ctx.deviceId,
        firstIp: ctx.ip,
        lastIp: ctx.ip,
        userAgent: ctx.userAgent,
      },
    });
    return;
  }

  if (ctx.ip && existing.lastIp && ctx.ip !== existing.lastIp) {
    const knownIp = await prisma.teamDevice.findFirst({
      where: { teamId, OR: [{ firstIp: ctx.ip }, { lastIp: ctx.ip }] },
    });
    if (!knownIp) {
      await prisma.securityFlag.create({
        data: {
          teamId,
          kind: "UNKNOWN_IP",
          detail: JSON.stringify({
            deviceId: ctx.deviceId,
            previousIp: existing.lastIp,
            newIp: ctx.ip,
            note: "IP not previously associated with this team's devices",
          }),
        },
      });
    }
  }

  await prisma.teamDevice.update({
    where: { id: existing.id },
    data: {
      lastIp: ctx.ip ?? existing.lastIp,
      userAgent: ctx.userAgent ?? existing.userAgent,
      lastSeenAt: new Date(),
    },
  });
}

export async function flagFastResolve(
  teamId: string,
  nodeId: string,
  elapsedSeconds: number,
  minExpectedSeconds: number
): Promise<void> {
  if (minExpectedSeconds <= 0 || elapsedSeconds >= minExpectedSeconds) return;
  await prisma.securityFlag.create({
    data: {
      teamId,
      nodeId,
      kind: "FAST_RESOLVE",
      detail: JSON.stringify({
        elapsedSeconds,
        minExpectedSeconds,
        note: "Node resolved faster than minExpectedSeconds — review only, no auto-penalty",
      }),
    },
  });
}
