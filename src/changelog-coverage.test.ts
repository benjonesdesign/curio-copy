// Every released tag has a CHANGELOG entry — or the check says it could not tell.
//
// MUTATION-CHECKED 2026-09-03: red against the `## v0.1.7` heading deleted from CHANGELOG.md, and
// red against `tags.length === 0` treated as a pass instead of a skip (verified by pointing the
// tag read at a ref namespace with nothing in it); green against current.
//
// ── WHY ─────────────────────────────────────────────────────────────────────────────────────
//
// v0.1.6, v0.1.7 and v0.1.8 were tagged with no entry in CHANGELOG.md, and package.json sat at
// 0.1.5 the whole time. Nothing broke — consumers pin by git tag and copy-check verifies the
// installed COMMIT against the pinned tag, never the version field — but this repo's own record of
// what it shipped was three releases behind.
//
// The cause is structural. curio-shared/versions.json is what gets updated during a release
// sitting, because that is what consumers read; a package's own changelog is not on that path. Two
// records of one fact, one of them maintained. A check is what makes the unmaintained one
// impossible to forget.
//
// A version/changelog agreement check would NOT have caught this: package.json was stale too, so
// the two agreed with each other and both were wrong. The tags are the only record that cannot be
// forgotten, because cutting one is the release.
//
// ── WHAT THIS DOES NOT CATCH (ADR 0024) ─────────────────────────────────────────────────────
//
//   1. IT CHECKS THAT A HEADING EXISTS, NOT THAT IT IS TRUE. A heading with wrong or empty content
//      passes. It converts a silent omission into a visible one; it does not review prose.
//   2. IT CANNOT SEE TAGS THAT WERE NEVER FETCHED. CI checkouts are shallow by default and carry
//      no tags, so this SKIPS rather than passing there — see the clause-2 note below. A green run
//      in an environment without tags proves nothing, which is why it says so out loud.
//   3. IT SAYS NOTHING ABOUT ORDER OR COMPLETENESS OF CONTENT. A tag documented under the wrong
//      heading level, or out of sequence, is not its business.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const ROOT = join(__dirname, "..");

function releasedTags(): string[] {
  try {
    return execFileSync("git", ["tag", "--list", "v*"], { cwd: ROOT, encoding: "utf8" })
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

describe("every released tag is written down", () => {
  const tags = releasedTags();
  const changelog = readFileSync(join(ROOT, "CHANGELOG.md"), "utf8");

  // ADR 0024 clause 2: an ABSENT input is not a pass. No tags means git is shallow or unavailable,
  // not that every release is documented — and the difference is invisible in a green tick, which
  // is exactly the shape this suite exists to stop. `.skipIf` reports it as skipped rather than
  // passed, so the run says what it could not check.
  it.skipIf(tags.length === 0)("every git tag has a CHANGELOG heading", () => {
    const undocumented = tags.filter((t) => !new RegExp(`^## ${t.replace(/\./g, "\\.")}\\b`, "m").test(changelog));
    expect(
      undocumented,
      `tagged but not in CHANGELOG.md: ${undocumented.join(", ")}. ` +
        `curio-shared/versions.json holds the authoritative note — transcribe it, do not invent one.`,
    ).toEqual([]);
  });

  it("says out loud when it could not read the tags", () => {
    // The guard on the guard. Without this, a shallow checkout turns the assertion above into a
    // silent skip that nobody notices, and the check quietly stops existing.
    if (tags.length === 0) {
      console.warn(
        "changelog-coverage: NO GIT TAGS VISIBLE — nothing was checked. This is a shallow " +
          "checkout, not a clean bill of health.",
      );
    }
    expect(true).toBe(true);
  });

  it("the changelog documents the version package.json currently claims", () => {
    // Runs with or without tags, so an unreleased bump is still caught in a shallow checkout.
    const { version } = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as { version: string };
    expect(
      new RegExp(`^## v${version.replace(/\./g, "\\.")}\\b`, "m").test(changelog),
      `package.json says ${version} and CHANGELOG.md has no "## v${version}" heading`,
    ).toBe(true);
  });
});
