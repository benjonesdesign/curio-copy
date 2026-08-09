// Fails if the committed Sources/CurioCopy/Strings.swift is stale vs a fresh regeneration from
// src/strings.json — the same drift guard curio-contracts and curio-tokens each run.
import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tmp = mkdtempSync(join(tmpdir(), "curio-copy-check-"));
try {
  execSync(`node scripts/gen-swift.mjs`, {
    env: { ...process.env, CURIO_COPY_OUT_DIR: tmp },
    stdio: "inherit",
  });
  const fresh = readFileSync(join(tmp, "Strings.swift"), "utf8");
  const committed = readFileSync("Sources/CurioCopy/Strings.swift", "utf8");
  if (fresh !== committed) {
    console.error("\n✗ Sources/CurioCopy/Strings.swift is stale vs src/strings.json — run: npm run build");
    process.exit(1);
  }
  console.log("curio-copy: generated Swift output is up to date.");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
