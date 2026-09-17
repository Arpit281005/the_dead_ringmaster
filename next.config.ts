import type { NextConfig } from "next";

const lanHost = process.env.DEV_LAN_HOST?.trim();
const allowedDevOrigins = [
  "10.0.3.195",
  "10.0.1.249",
  ...(lanHost ? [lanHost] : []),
].filter((v, i, arr) => Boolean(v) && arr.indexOf(v) === i);

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  // Phone/LAN access to `next dev` — `npm run dev:lan` sets DEV_LAN_HOST
  allowedDevOrigins,
};

export default nextConfig;
