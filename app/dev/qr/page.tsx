import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSignedQrPayload } from "@/lib/qr-token";

export const dynamic = "force-dynamic";

export default async function DevQrPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const nodes = await prisma.node.findMany({
    orderBy: [{ isDecoy: "asc" }, { sequenceIndex: "asc" }],
    select: {
      id: true,
      nodeSlot: true,
      token: true,
      isDecoy: true,
      sequenceIndex: true,
      act: true,
      locationName: true,
      locationDescription: true,
      decoyPool: true,
      suspect: { select: { name: true } },
    },
  });

  const withQr = await Promise.all(
    nodes.map(async (n) => {
      const payload = createSignedQrPayload(n.nodeSlot, n.token);
      return {
        node: n,
        payload,
        qr: await QRCode.toDataURL(payload, { margin: 1, width: 220 }),
      };
    })
  );

  return (
    <main className="flex-1 px-5 py-8 max-w-4xl mx-auto w-full">
      <h1 className="font-display text-2xl font-black mb-1">Dev QR Sheet</h1>
      <p className="text-sm text-ink/60 mb-8">
        Development helper only — hidden in production. For the organiser print
        sheet (decoys by pool), use{" "}
        <a href="/admin/print" className="underline">
          /admin/print
        </a>{" "}
        after signing in.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {withQr.map(({ node, payload, qr }) => (
          <div key={node.id} className="paper-card rounded-sm p-4 flex flex-col items-center gap-2 text-center">
            <p className="font-chrome text-[10px] uppercase tracking-wide text-ink/50">
              {node.isDecoy
                ? `Decoy · pool ${node.decoyPool ?? "?"}`
                : `Tent ${node.sequenceIndex + 1} · Act ${node.act}`}
            </p>
            <p className="font-display font-bold">{node.locationName}</p>
            {node.suspect && <p className="text-xs text-ink/60">{node.suspect.name}</p>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={node.locationName} className="w-40 h-40" />
            <code className="text-[10px] bg-ink/5 px-2 py-1 rounded-sm break-all">{payload}</code>
            <p className="text-[11px] text-ink/50">{node.locationDescription}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
