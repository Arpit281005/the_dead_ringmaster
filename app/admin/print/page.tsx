import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { createSignedQrPayload } from "@/lib/qr-token";
import QRCode from "qrcode";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPrintPage() {
  await requireAdmin();

  const nodes = await prisma.node.findMany({
    orderBy: [{ isDecoy: "asc" }, { act: "asc" }, { sequenceIndex: "asc" }],
    include: { suspect: { select: { name: true } } },
  });

  const story = nodes.filter((n) => !n.isDecoy);
  const decoys = nodes.filter((n) => n.isDecoy);
  const pools = ["act1", "act2", "act3"] as const;

  async function withQr<T extends { nodeSlot: string; token: string }>(n: T) {
    const payload = createSignedQrPayload(n.nodeSlot, n.token);
    return {
      ...n,
      payload,
      qr: await QRCode.toDataURL(payload, { margin: 1, width: 180 }),
    };
  }

  const storyQr = await Promise.all(story.map(withQr));
  const decoyQr = await Promise.all(decoys.map(withQr));

  return (
    <main className="px-6 py-8 max-w-4xl mx-auto print:max-w-none">
      <div className="flex justify-between items-start mb-6 print:hidden">
        <div>
          <Link href="/admin" className="text-xs font-chrome uppercase text-ink/50">
            ← Admin
          </Link>
          <h1 className="font-display text-2xl font-black">QR print sheet</h1>
          <p className="text-sm text-ink/60">
            One sticker per physical node — shared across all teams (slot-bound, not spent).
            Decoys grouped by act pool. Use browser Print (⌘P / Ctrl+P).
          </p>
        </div>
      </div>
      <h2 className="font-display text-lg font-bold mb-3">Story tents</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {storyQr.map((n) => (
          <div key={n.id} className="border border-ink/20 p-3 break-inside-avoid text-center">
            <p className="font-chrome text-[10px] uppercase text-ink/50">
              Slot {n.nodeSlot} · Tent {n.sequenceIndex + 1} · Act {n.act}
            </p>
            <p className="font-display font-bold">{n.locationName}</p>
            {n.suspect && <p className="text-xs">{n.suspect.name}</p>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={n.qr} alt="" className="mx-auto w-36 h-36" />
            <p className="text-[11px] text-ink/60 mt-1">{n.locationDescription}</p>
            <p className="text-[10px] mt-2 italic">
              Volunteer: stay with this tent; speak cipher word only if this tent uses a volunteer key
              (see /dev/riddle-keys).
            </p>
            <code className="text-[9px] break-all block mt-1">{n.payload}</code>
          </div>
        ))}
      </div>

      {pools.map((pool) => {
        const group = decoyQr.filter((d) => d.decoyPool === pool);
        if (group.length === 0) return null;
        return (
          <div key={pool} className="mb-10">
            <h2 className="font-display text-lg font-bold mb-3">
              Decoy pool · {pool}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {group.map((n) => (
                <div key={n.id} className="border border-ink/20 p-3 break-inside-avoid text-center">
                  <p className="font-chrome text-[10px] uppercase text-ink/50">
                    Slot {n.nodeSlot} · Decoy · {pool}
                  </p>
                  <p className="font-display font-bold">{n.locationName}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={n.qr} alt="" className="mx-auto w-36 h-36" />
                  <p className="text-[11px] text-ink/60 mt-1">{n.locationDescription}</p>
                  <p className="text-[10px] mt-2 italic">
                    Volunteer: place out of the main path; only misled teams should find this.
                  </p>
                  <code className="text-[9px] break-all block mt-1">{n.payload}</code>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </main>
  );
}
