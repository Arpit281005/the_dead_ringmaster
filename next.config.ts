import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
  // Phone/LAN access to `next dev` — update when your Wi‑Fi IP changes
  allowedDevOrigins: ["10.0.3.195", "10.0.1.249"],
};

export default nextConfig;
