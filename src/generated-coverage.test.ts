// Every label set in strings.json reaches Swift AND Kotlin — or is exempted here with a reason.
//
// check-drift.mjs compares each committed generated tree against a fresh regeneration, which
// catches a STALE output but is blind to a MISSING one: both generators list their label sets in a
// hand-written FLAT_GROUPS map, so a new top-level key is simply never generated, a fresh regen
// matches the committed file byte for byte, and the drift guard reports green.
//
// That is not hypothetical. `assumptionLabels` was added for W21 7.1 — the requirement that an
// assumed sales channel is "labelled as an assumption, never presented as a choice the seller
// made" — and landed in TypeScript only. Web could satisfy 7.1; iOS and Android could not, with
// every check in this repo passing. Guards attach to mechanisms, not symptoms, so this checks the
// mechanism: a key that exists on one platform and not the others.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import strings from "./strings.json" with { type: "json" };

const ROOT = join(__dirname, "..");
const TARGETS = [
  ["Swift", "Sources/CurioCopy/Strings.swift"],
  ["Kotlin", "src/main/kotlin/com/curio/copy/Strings.kt"],
] as const;

/** Top-level keys deliberately not emitted to the native targets, each with why. */
const NOT_GENERATED: Record<string, string> = {
  $schema: "A JSON-Schema pointer, not copy.",
  statusLabels:
    "Nested, not flat. Its two children (legacyCardStatus, physicalCardLifecycle) ARE generated, " +
    "as LegacyCardStatusLabels and PhysicalCardLifecycleLabels — checked by name below.",
};

/** Keys the generators emit under a different enum name. Listed rather than pattern-matched: a
 *  loose substring test would let `recommendationRouteLabels` be "found" by `RouteReasonLabels`
 *  and quietly stop checking it. */
const RENAMED: Record<string, string> = {
  recommendationRouteLabels: "RouteLabels",
};

/** The generated enum name for a strings.json key: `fooBarLabels` -> `FooBarLabels`. */
function enumName(key: string): string {
  return RENAMED[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

describe("generated copy covers every label set on every platform", () => {
  const sources = TARGETS.map(([name, rel]) => [name, readFileSync(join(ROOT, rel), "utf8")] as const);
  const keys = Object.keys(strings as Record<string, unknown>);

  it("finds the keys and both generated files (guards against a vacuous pass)", () => {
    expect(keys.length).toBeGreaterThan(5);
    for (const [name, src] of sources) expect(src.length, `${name} output is empty`).toBeGreaterThan(500);
  });

  it.each(TARGETS.map(([n]) => n))("%s carries every label set", (target) => {
    const src = sources.find(([n]) => n === target)![1];
    const missing = keys
      .filter((k) => !(k in NOT_GENERATED))
      .filter((k) => !src.includes(`enum ${enumName(k)}`) && !src.includes(`object ${enumName(k)}`));
    expect(missing, `${target} is missing: ${missing.join(", ")}`).toEqual([]);
  });

  it("generates statusLabels' two children under their own names", () => {
    for (const [name, src] of sources) {
      expect(src, `${name} is missing LegacyCardStatusLabels`).toContain("LegacyCardStatusLabels");
      expect(src, `${name} is missing PhysicalCardLifecycleLabels`).toContain("PhysicalCardLifecycleLabels");
    }
  });

  it("has no stale exemption for a key that no longer exists", () => {
    const stale = Object.keys(NOT_GENERATED).filter((k) => !keys.includes(k));
    expect(stale, `exempted keys that are gone from strings.json: ${stale.join(", ")}`).toEqual([]);
  });
});
