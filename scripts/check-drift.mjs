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
// ── Release integrity ──────────────────────────────────────────────────────────────────────
//
// Mirrors curio-contracts'. Added after v0.1.3's changelog claimed a Kotlin target that an `npm
// install` could not see: the target WAS in the tag, but package.json's `files` list predated it,
// so the npm package shipped Swift only. The changelog was right about the repo and wrong about
// what a consumer received — the same "assertion pointing at something that isn't there" defect
// one layer up from code.
import { execSync as exec } from "node:child_process";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const files = pkg.files ?? [];
for (const required of ["Sources", "src/main/kotlin"]) {
  if (!files.some((f) => f === required || f.startsWith(`${required}/`))) {
    console.error(`\n✗ package.json "files" omits ${required} — the npm package would ship without it, ` +
                  `while the repo and changelog claim it exists.`);
    failed = true;
  }
}

try {
  const tag = exec("git describe --exact-match --tags HEAD 2>/dev/null", { encoding: "utf8" }).trim();
  if (tag && tag !== `v${pkg.version}`) {
    console.error(`\n✗ HEAD is tagged ${tag} but package.json says ${pkg.version}.`);
    failed = true;
  }
} catch { /* HEAD isn't tagged — normal mid-development */ }

if (failed) process.exit(1);
console.log("curio-copy: Swift and Kotlin output up to date, and both are shipped.");
