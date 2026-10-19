// MUTATION-CHECKED 2026-10-19: red against v0.1.11 removed from HISTORICAL_MISMATCH (the test reports 'v0.1.11 has package.json 0.1.10'); green against current.
//
// WHY (production incident, 19 Oct 2026): v0.1.11 was tagged with "version": "0.1.10" in package.json, identical to v0.1.10.
// Web pins this package by git tag, but Next/webpack and Vercel's build cache treat a node_modules package as unchanged when its
// name and package.json version match, so the restored build cache kept the OLD compiled strings.json (no moneySettings) and the
// production Settings page crashed with `STRINGS.moneySettings` undefined. The package contents at the tag were correct.
//
// RULE: from v0.1.12 on, every tag's package.json version must equal the tag. A tag whose package.json carries another
// version can be served stale by a build cache. The earlier mismatches are listed, not forgiven: they cannot be re-tagged.
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = join(__dirname, "..");

/** Tags that already shipped with a package.json version that is not theirs (v0.1.6-v0.1.8: stale 0.1.5, see
 *  changelog-coverage.test.ts; v0.1.11: stale 0.1.10, the 19 Oct incident). Never add to this list: bump instead. */
const HISTORICAL_MISMATCH = new Set(["v0.1.6", "v0.1.7", "v0.1.8", "v0.1.11"]);

function tags(): string[] {
  try {
    return execFileSync("git", ["tag", "--list", "v*"], { cwd: ROOT, encoding: "utf8" }).split("\n").map((t) => t.trim()).filter(Boolean);
  } catch { return []; }
}

function versionAt(tag: string): string | null {
  try {
    return (JSON.parse(execFileSync("git", ["show", `${tag}:package.json`], { cwd: ROOT, encoding: "utf8" })) as { version?: string }).version ?? null;
  } catch { return null; }
}

describe("a tag's package.json version is the tag (a stale version string is served from build caches)", () => {
  const all = tags();

  // ADR 0024 clause 2: no tags visible (a shallow checkout) is a skip, said out loud, not a pass.
  it.skipIf(all.length === 0)("every tag carries its own version in package.json", () => {
    const wrong = all
      .filter((t) => !HISTORICAL_MISMATCH.has(t))
      .filter((t) => versionAt(t) !== t.replace(/^v/, ""))
      .map((t) => `${t} has package.json ${versionAt(t)}`);
    expect(wrong, `bump package.json to the tag's version in the same commit you tag: ${wrong.join("; ")}`).toEqual([]);
  });

  it.skipIf(all.length === 0)("the historical mismatches are real (the allowlist does not forgive a tag that is now fine)", () => {
    const stale = [...HISTORICAL_MISMATCH].filter((t) => all.includes(t) && versionAt(t) === t.replace(/^v/, ""));
    expect(stale, `remove from HISTORICAL_MISMATCH: ${stale.join(", ")}`).toEqual([]);
  });

  it("says out loud when it could not read the tags", () => {
    if (all.length === 0) console.warn("tag-version: NO GIT TAGS VISIBLE: nothing was checked. A shallow checkout, not a clean bill of health.");
    expect(true).toBe(true);
  });
});
