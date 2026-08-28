// Fails if either committed generated tree is stale vs a fresh regeneration from src/strings.json
// — the same drift guard curio-contracts and curio-tokens each run.
//
// Covers KOTLIN as well as Swift as of 2026-08-28. A guard that checks one of two generated
// outputs would have reported green while the other drifted, which is the "looks like enforcement"
// failure decisions/0026 records against this project's own conformance claims.
import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TARGETS = [
  { name: "Swift", script: "scripts/gen-swift.mjs", envVar: "CURIO_COPY_OUT_DIR",
    file: "Strings.swift", committed: "Sources/CurioCopy/Strings.swift" },
  { name: "Kotlin", script: "scripts/gen-kotlin.mjs", envVar: "CURIO_COPY_KOTLIN_OUT_DIR",
    file: "Strings.kt", committed: "src/main/kotlin/com/curio/copy/Strings.kt" },
];

let failed = false;
for (const t of TARGETS) {
  const tmp = mkdtempSync(join(tmpdir(), "curio-copy-check-"));
  try {
    execSync(`node ${t.script}`, { env: { ...process.env, [t.envVar]: tmp }, stdio: "inherit" });
    if (readFileSync(join(tmp, t.file), "utf8") !== readFileSync(t.committed, "utf8")) {
      console.error(`\n✗ ${t.committed} is stale vs src/strings.json — run: npm run build`);
      failed = true;
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}
if (failed) process.exit(1);
console.log("curio-copy: generated Swift and Kotlin output are both up to date.");
