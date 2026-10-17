import { describe, it, expect } from "vitest";
import { STRINGS, dispositionLabels } from "./strings.js";

describe("STRINGS", () => {
  it("has no empty string values anywhere (a blank label is always a mistake)", () => {
    function walk(node: unknown, path: string): void {
      if (typeof node === "string") {
        expect(node.trim(), `empty string at ${path}`).not.toBe("");
        return;
      }
      if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node)) {
          if (k.startsWith("$")) continue; // metadata keys, not copy
          walk(v, `${path}.${k}`);
        }
      }
    }
    walk(STRINGS, "STRINGS");
  });

  it("covers all 6 recommendation routes", () => {
    expect(Object.keys(STRINGS.recommendationRouteLabels).sort()).toEqual(
      ["bulk", "bundle", "do_not_list", "grade_review", "hold", "list_single", "restoration_review"].sort(),
    );
  });

  it("covers all 6 CONDITIONS values", () => {
    expect(Object.keys(STRINGS.conditionLabels)).toEqual(["NM", "LP", "MP", "HP", "DMG", "Graded"]);
  });

  it("no route/status label starts or ends with whitespace, and none is ALL CAPS (sentence case rule)", () => {
    const allLabels = [
      ...Object.values(STRINGS.statusLabels.legacyCardStatus),
      ...Object.values(STRINGS.statusLabels.physicalCardLifecycle),
      ...Object.values(STRINGS.recommendationRouteLabels),
    ];
    for (const label of allLabels) {
      expect(label).toBe(label.trim());
      // A label is only flagged if it has letters and they're ALL uppercase (excludes short
      // acronym-only labels like "NM" by requiring at least one word of length > 3).
      const isShouting = /[A-Z]{4,}/.test(label) && label === label.toUpperCase();
      expect(isShouting, `"${label}" looks ALL CAPS — sentence case only`).toBe(false);
    }
  });

  // ── Sale venue and disposition — curio-shared decisions/0030 ────────────────────────────
  //
  // MUTATION-CHECKED 2026-09-03: red against `local` renamed to `local_sale` in strings.json (the
  // slug the two web dropdowns disagreed on), and red against `keep` added to saleVenueLabels
  // (which is the exact conflation 0030 exists to prevent — a venue of "keep" means no sale
  // happened). Green against current.

  it("disposition is the venue list PLUS the non-sale outcomes, and they do not overlap", () => {
    // The composition rule from 0030. If a key appeared in both, `dispositionLabels` would silently
    // take one and drop the other — and the two lists would have started drifting again, which is
    // the entire defect this vocabulary replaces.
    const venue = Object.keys(STRINGS.saleVenueLabels);
    const only = Object.keys(STRINGS.dispositionOnlyLabels);
    const overlap = only.filter((k) => venue.includes(k));
    expect(overlap, `these are in both lists: ${overlap.join(", ")}`).toEqual([]);
    expect(Object.keys(dispositionLabels).sort()).toEqual([...venue, ...only].sort());
  });

  it("the non-sale outcomes are EXACTLY keep and bundle", () => {
    // Pinned, because this set is the whole argument for two vocabularies rather than one. If a
    // real venue drifts in here it stops being offerable as a sale venue; if `keep` drifts out,
    // there is no reason for the split to exist.
    expect(Object.keys(STRINGS.dispositionOnlyLabels).sort()).toEqual(["bundle", "keep"]);
  });

  it("carries one `local`, not the two labels web was offering", () => {
    // "Local / cash" on one screen and "Local sale" on the other meant a sale recorded on one did
    // not match a filter on the other. One slug, one label.
    expect(STRINGS.saleVenueLabels.local).toBe("Local / cash");
    const localish = Object.keys(STRINGS.saleVenueLabels).filter((k) => k.includes("local"));
    expect(localish).toEqual(["local"]);
  });

  it("offers no test environment as a place a seller sold something", () => {
    // "eBay Sandbox" was PLATFORMS[0] on web's record-a-sale screen — the DEFAULT answer to
    // "where did you sell this card". It must not come back through the shared vocabulary.
    const testish = Object.entries(STRINGS.saleVenueLabels)
      .filter(([k, v]) => /sandbox|test|staging/i.test(k) || /sandbox|test|staging/i.test(v));
    expect(testish.map(([k]) => k)).toEqual([]);
  });

  it("no error copy contains 'please' (voice rule)", () => {
    for (const [key, msg] of Object.entries(STRINGS.errorCopy)) {
      expect(msg.toLowerCase().includes("please"), `errorCopy.${key} contains "please"`).toBe(false);
    }
  });
});
