#!/usr/bin/env node
/**
 * LAN HTTPS dev server — required for phone camera (getUserMedia needs a secure context).
 * Usage: npm run dev:lan
 */
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const certDir = join(root, ".certs");
const keyPath = join(certDir, "dev-key.pem");
const certPath = join(certDir, "dev-cert.pem");
const metaPath = join(certDir, "lan-ip.txt");

function detectLanIp() {
  let nets;
  try {
    nets = networkInterfaces();
  } catch {
    return "127.0.0.1";
  }
  const preferred = [];
  const fallback = [];
  for (const entries of Object.values(nets)) {
    if (!entries) continue;
    for (const net of entries) {
      if (net.family !== "IPv4" && net.family !== 4) continue;
      if (net.internal) continue;
      if (net.address.startsWith("10.") || net.address.startsWith("192.168.")) {
        preferred.push(net.address);
      } else if (net.address.startsWith("172.")) {
        const second = Number(net.address.split(".")[1]);
        if (second >= 16 && second <= 31) preferred.push(net.address);
        else fallback.push(net.address);
      } else {
        fallback.push(net.address);
      }
    }
  }
  return preferred[0] ?? fallback[0] ?? "127.0.0.1";
}

function ensureCerts(lanIp) {
  mkdirSync(certDir, { recursive: true });
  const prior = existsSync(metaPath) ? readFileSync(metaPath, "utf8").trim() : "";
  if (existsSync(keyPath) && existsSync(certPath) && prior === lanIp) {
    return;
  }

  const san = `DNS:localhost,IP:127.0.0.1,IP:${lanIp}`;
  const confPath = join(certDir, "openssl.cnf");
  writeFileSync(
    confPath,
    `[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = carnival-of-lies-dev

[v3_req]
subjectAltName = ${san}
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
`
  );

  try {
    execFileSync(
      "openssl",
      [
        "req",
        "-x509",
        "-newkey",
        "rsa:2048",
        "-nodes",
        "-keyout",
        keyPath,
        "-out",
        certPath,
        "-days",
        "825",
        "-config",
        confPath,
        "-extensions",
        "v3_req",
      ],
      { stdio: "pipe" }
    );
  } catch (err) {
    console.error(
      "\nFailed to generate TLS certs with openssl. Install OpenSSL and retry.\n",
      err instanceof Error ? err.message : err
    );
    process.exit(1);
  }
  writeFileSync(metaPath, lanIp);
  console.log(`Generated LAN TLS cert for ${lanIp} → .certs/`);
}

const lanIp = detectLanIp();
ensureCerts(lanIp);

console.log(`
Phone / LAN camera testing
  Open:  https://${lanIp}:3000
  Accept the self-signed certificate warning once on the phone.
  Camera will not work on http://${lanIp}:3000 (insecure context).
`);

const child = spawn(
  "npx",
  [
    "next",
    "dev",
    "-H",
    "0.0.0.0",
    "--experimental-https",
    "--experimental-https-key",
    keyPath,
    "--experimental-https-cert",
    certPath,
  ],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      DEV_LAN_HOST: lanIp,
    },
  }
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => child.kill(sig));
}
