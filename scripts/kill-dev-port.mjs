#!/usr/bin/env node
/** Stop processes listening on the project dev port (default 3005). */

import { execSync } from "node:child_process";

const port = process.argv[2] ?? "3005";

if (!/^\d+$/.test(port)) {
  throw new Error(`Invalid port: ${port}`);
}

try {
  const raw = execSync(
    `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue).OwningProcess | Sort-Object -Unique"`,
    { encoding: "utf8" },
  ).trim();

  if (!raw) {
    console.log(`Port ${port} is free`);
    process.exit(0);
  }

  const pids = raw
    .split(/\s+/)
    .map((value) => Number.parseInt(value, 10))
    .filter((pid) => Number.isFinite(pid) && pid > 0);

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`Stopped PID ${pid} on port ${port}`);
    } catch {
      // Process may have already exited
    }
  }

  if (pids.length > 0) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500);
  }
} catch {
  console.log(`Port ${port} is free`);
}
