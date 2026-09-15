import QRCode from "qrcode";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DevQrPage() {
  const nodes = await prisma.node.findMany({
    orderBy: [{ isDecoy: "asc" }, { sequenceIndex: "asc" }],
    include: { suspect: true },
  });

  const withQr = await Promise.all(
    nodes.map(async (n) => ({
      node: n,
      qr: await QRCode.toDataURL(n.token, { margin: 1, width: 220 }),
    }))
  );

  return (
    <main className="flex-1 px-5 py-8 max-w-4xl mx-auto w-full">
      <h1 className="font-display text-2xl font-black mb-1">Dev QR Sheet</h1>
      <p className="text-sm text-ink/60 mb-8">
        Testing helper only — not the organiser print sheet. Scan these with the in-app scanner or
        type the code shown under each.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {withQr.map(({ node, qr }) => (
          <div key={node.id} className="paper-card rounded-sm p-4 flex flex-col items-center gap-2 text-center">
            <p className="font-chrome text-[10px] uppercase tracking-wide text-ink/50">
              {node.isDecoy ? "Decoy" : `Tent ${node.sequenceIndex + 1} · Act ${node.act}`}
            </p>
            <p className="font-display font-bold">{node.locationName}</p>
            {node.suspect && <p className="text-xs text-ink/60">{node.suspect.name}</p>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={node.locationName} className="w-40 h-40" />
            <code className="text-xs bg-ink/5 px-2 py-1 rounded-sm break-all">{node.token}</code>
            <p className="text-[11px] text-ink/50">{node.locationDescription}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
