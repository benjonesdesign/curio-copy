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

// ── Design additions, 2026-10-09 ────────────────────────────────────────────────────────────────
// The keys of the first four sets are curio-contracts v0.2.0's wire values (PR #35, untagged at the
// time of writing). They are pinned HERE as literals, deliberately: this package does not depend on
// the contract, so a key renamed on either side shows up as a failure rather than as a label that
// is silently never looked up.
describe("economics, postage and listing-refusal copy (design additions, 2026-10-09)", () => {
  const sorted = (o: object) => Object.keys(o).sort();

  it("most-to-pay unavailable reasons: the six contract codes, in both the sentence and line forms", () => {
    const codes = ["asking_price_only", "margin_not_set", "no_price", "not_viable", "seller_type_not_set", "vat_not_set"];
    expect(sorted(STRINGS.maxBuyUnavailableReasonLabels)).toEqual(codes);
    expect(sorted(STRINGS.maxBuyLineUnavailableLabels)).toEqual(codes);
  });

  it("a null breakdown line never reads as zero money", () => {
    // not_viable's line is "Nothing left", never a figure: £0 would say the sale breaks even.
    for (const [code, label] of Object.entries(STRINGS.maxBuyLineUnavailableLabels)) {
      expect(label, `${code} reads as a figure`).not.toMatch(/[£0-9]/);
    }
    expect(STRINGS.maxBuyLineUnavailableLabels.not_viable).toBe("Nothing left");
  });

  it("fee not set: the two contract reasons, and a value that reads 'Not set'", () => {
    expect(sorted(STRINGS.feeNotSetReasonLabels)).toEqual(["seller_type_not_set", "vat_not_set"]);
    expect(STRINGS.feeNotSetValueLabel).toEqual({ value: "Not set" });
  });

  it("postage services: exactly the four contract service codes, with the H6 labels", () => {
    expect(sorted(STRINGS.postageServiceLabels)).toEqual(
      ["rm24_ll", "rm48_ll", "special_delivery", "tracked48_sp"],
    );
    expect(STRINGS.postageServiceLabels).toEqual({
      rm48_ll: "Royal Mail 48 · large letter",
      rm24_ll: "Royal Mail 24 · large letter",
      tracked48_sp: "Tracked 48 · small parcel",
      special_delivery: "Special Delivery",
    });
  });

  it("listing refusals: the sentence and the short form carry the same codes", () => {
    // Two forms of one vocabulary. A code in one and not the other is a table cell that falls back
    // to inventing a word, or a result line with no sentence.
    expect(sorted(STRINGS.listingRefusalShortLabels)).toEqual(sorted(STRINGS.listingRefusalReasonLabels));
  });

  it("listing refusals: the contract's reasons are all here, bar the one it has that design did not write", () => {
    // curio-contracts' ListingRefusalReason (PR #35): mine, set_aside, unmatched, slab_unverified,
    // condition_not_confirmed, no_price, no_sku, game_not_available, already_live.
    // `slab_unverified` has NO copy yet (design's file omits it) and `sold` / `archived` are ahead
    // of the contract (#260). Both are reported in CHANGELOG.md. When design writes
    // slab_unverified, move it from MISSING to the literal below, and this test makes sure it landed.
    const CONTRACT = ["already_live", "condition_not_confirmed", "game_not_available", "mine", "no_price",
                      "no_sku", "set_aside", "slab_unverified", "unmatched"];
    const MISSING = ["slab_unverified"];
    const have = Object.keys(STRINGS.listingRefusalReasonLabels);
    expect(CONTRACT.filter((c) => !have.includes(c))).toEqual(MISSING);
    expect(have.filter((c) => !CONTRACT.includes(c)).sort()).toEqual(["archived", "sold"]);
  });

  it("short refusal labels fit a table cell: no full stop, 24 characters or fewer", () => {
    for (const [code, label] of Object.entries(STRINGS.listingRefusalShortLabels)) {
      expect(label.length, `${code}: "${label}" is too long for a cell`).toBeLessThanOrEqual(24);
      expect(label, `${code} ends like a sentence`).not.toMatch(/[.!?]$/);
    }
  });

  it("sentence refusals are sentences: they end with a full stop", () => {
    for (const [code, label] of Object.entries(STRINGS.listingRefusalReasonLabels)) {
      expect(label, `${code} is not a finished sentence`).toMatch(/\.$/);
    }
  });

  it("negative receive says the seller pays, not 'below cost'", () => {
    // "Below cost" reads as below what the seller PAID for the card, which is a different and much
    // commoner situation (profit). A negative receive means fees and postage exceed the price.
    expect(STRINGS.receiveLabels.negative).toBe("You'd pay to sell this");
    expect(JSON.stringify(STRINGS).toLowerCase()).not.toContain("below cost");
  });

  it("holding and identification have status words, and a draft is a state, not an event", () => {
    const l = STRINGS.statusLabels.physicalCardLifecycle;
    expect(l.HELD).toBe("Held");
    expect(l.UNMATCHED).toBe("Not identified");
    expect(l.IDENTIFYING).toBe("Identifying");
    expect(l.RETURNED).toBe("Returned");
    expect(l.EBAY_DRAFT).toBe("Draft on eBay");
  });

  it("no label counts or mentions listing time (Ben, 2026-10-09: listing time is gone everywhere)", () => {
    // Packing time is real and estimated; listing time is not counted anywhere, so nothing may
    // label it, beside a figure or otherwise.
    const hits: string[] = [];
    (function walk(node: unknown, path: string): void {
      if (typeof node === "string") {
        if (/listing time|time to list|minutes? to list|to list a card|your time/i.test(node)) hits.push(`${path}: ${node}`);
      } else if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
      }
    })(STRINGS, "STRINGS");
    expect(hits).toEqual([]);
  });

  it("the new sets carry no placeholder and no UI decoration (README: plain content, composed per platform)", () => {
    const sets = [
      STRINGS.maxBuyUnavailableReasonLabels, STRINGS.maxBuyLineUnavailableLabels,
      STRINGS.feeNotSetReasonLabels, STRINGS.feeNotSetValueLabel, STRINGS.postageServiceLabels,
      STRINGS.listingRefusalReasonLabels, STRINGS.listingRefusalShortLabels, STRINGS.receiveLabels,
    ];
    for (const set of sets) {
      for (const [code, label] of Object.entries(set)) {
        expect(label, `${code} has a placeholder`).not.toMatch(/[{}]|%[@sd@]|\$\{/);
        expect(label, `${code} carries leading or trailing decoration`).not.toMatch(/^[\s→—–…·-]|[\s→—–…-]$/);
        expect(label.toLowerCase(), `${code} says please`).not.toContain("please");
      }
    }
  });
});
