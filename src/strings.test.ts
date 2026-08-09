import { describe, it, expect } from "vitest";
import { STRINGS } from "./strings.js";

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

  it("no error copy contains 'please' (voice rule)", () => {
    for (const [key, msg] of Object.entries(STRINGS.errorCopy)) {
      expect(msg.toLowerCase().includes("please"), `errorCopy.${key} contains "please"`).toBe(false);
    }
  });
});
