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
// The keys of these sets are curio-contracts v0.2.0's wire values (branch
// code-tab/v0.2.0-nullable-maxbuy-fee-1008 @ 1853327, untagged at the time of writing). They are
// pinned HERE as literals, deliberately: this package does not depend on the contract, so a key
// renamed on either side shows up as a failure rather than as a label that is silently never
// looked up.
describe("economics, postage and listing-refusal copy (design additions, 2026-10-09)", () => {
  const sorted = (o: object) => Object.keys(o).sort();

  it("most-to-pay unavailable reasons: the five contract codes, in both the sentence and line forms", () => {
    const codes = ["margin_not_set", "no_price", "not_viable", "seller_type_not_set", "vat_not_set"];
    expect(sorted(STRINGS.maxBuyUnavailableReasonLabels)).toEqual(codes);
    expect(sorted(STRINGS.maxBuyLineUnavailableLabels)).toEqual(codes);
  });

  it("asking prices are a flag on a shown figure, never a reason it is withheld", () => {
    // Rule 10: a figure worked from asking prices is shown as a ceiling and says so. A label for
    // `asking_price_only` as an "unavailable" reason would put the withholding back.
    expect(STRINGS.maxBuyUnavailableReasonLabels).not.toHaveProperty("asking_price_only");
    expect(STRINGS.maxBuyLineUnavailableLabels).not.toHaveProperty("asking_price_only");
    const caption = STRINGS.maxBuyAskingBasisCaption.value;
    expect(Object.keys(STRINGS.maxBuyAskingBasisCaption)).toEqual(["value"]);
    expect(caption).toContain("asking prices");
    expect(caption.toLowerCase()).toContain("ceiling");
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

  it("seller type unavailable: the picker's notice, with design's curly quotes around Not set", () => {
    expect(STRINGS.sellerTypeUnavailableNotice).toEqual({ value: "You can't change this yet. Until you can, fees read “Not set”." });
    // It names the value the fee reads while the write is held; that value is the shared one.
    expect(STRINGS.sellerTypeUnavailableNotice.value).toContain("\u201c" + STRINGS.feeNotSetValueLabel.value + "\u201d");
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

  it("listing refusals: both forms carry exactly the contract's eleven reasons, in its order", () => {
    // ListingRefusalReason, curio-contracts @ 1853327. Order is part of the pin: the contract
    // documents it as the order of the enum, and a reorder is a change somebody should see.
    const CONTRACT = ["mine", "set_aside", "unmatched", "slab_unverified", "condition_not_confirmed",
                      "no_price", "no_sku", "game_not_available", "already_live", "sold", "archived"];
    expect(Object.keys(STRINGS.listingRefusalReasonLabels)).toEqual(CONTRACT);
    expect(Object.keys(STRINGS.listingRefusalShortLabels)).toEqual(CONTRACT);
  });

  it("an unverified slab is told plainly, with no next step it cannot take", () => {
    // QD.4: never listed as graded. No verify action is drawn (D4b is open), so the sentence must
    // not promise one.
    expect(STRINGS.listingRefusalReasonLabels.slab_unverified).toBe(
      "Graded slab not verified. Seek doesn't list an unverified slab as graded.",
    );
    expect(STRINGS.listingRefusalShortLabels.slab_unverified).toBe("Not verified");
    expect(STRINGS.listingRefusalReasonLabels.slab_unverified.toLowerCase()).not.toContain("verify it");
  });

  it("change refusals: both forms carry exactly the contract's six reasons, in its order", () => {
    // InventoryChangeRefusalReason, curio-contracts @ 8691519. Complete: every reason has a
    // sentence and a short form, so a client never meets one with no label.
    const CONTRACT = ["live_on_ebay", "sold", "archived", "set_aside", "not_found", "write_failed"];
    expect(Object.keys(STRINGS.changeRefusalReasonLabels)).toEqual(CONTRACT);
    expect(Object.keys(STRINGS.changeRefusalShortLabels)).toEqual(CONTRACT);
  });

  it("change refusals are their own set and no change sentence mentions listing", () => {
    // "A sold copy can't be listed again" is wrong for a Mark as Mine refusal.
    // ONE exemption, by key: live_on_ebay reads "End the listing first. It's live on eBay." and
    // "listing" there is the EXISTING eBay listing the seller has to end, not a "can't be listed"
    // refusal. Every other key still fails if it says list, listed or listing.
    const EXISTING_LISTING_KEY = "live_on_ebay";
    for (const [code, label] of Object.entries(STRINGS.changeRefusalReasonLabels)) {
      if (code !== EXISTING_LISTING_KEY) {
        expect(label.toLowerCase(), `${code} talks about listing`).not.toMatch(/\blist(ed|ing)?\b/);
      }
      expect(label, `${code} is not a finished sentence`).toMatch(/\.$/);
    }
    // The exemption is exactly that key and exactly that sentence: it must still say the listing is
    // the seller's own, live one.
    expect(STRINGS.changeRefusalReasonLabels.live_on_ebay).toBe("End the listing first. It's live on eBay.");
    expect(STRINGS.changeRefusalShortLabels.live_on_ebay).toBe("Live on eBay");
    const listing: Record<string, string> = STRINGS.listingRefusalReasonLabels;
    for (const code of ["sold", "archived", "set_aside"] as const) {
      expect(STRINGS.changeRefusalReasonLabels[code], `${code} reuses the listing sentence`).not.toBe(listing[code]);
    }
  });

  it("short refusal labels fit a table cell: no full stop, 24 characters or fewer", () => {
    for (const set of [STRINGS.listingRefusalShortLabels, STRINGS.changeRefusalShortLabels]) {
      for (const [code, label] of Object.entries(set)) {
        expect(label.length, `${code}: "${label}" is too long for a cell`).toBeLessThanOrEqual(24);
        expect(label, `${code} ends like a sentence`).not.toMatch(/[.!?]$/);
      }
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
      STRINGS.maxBuyAskingBasisCaption, STRINGS.feeNotSetReasonLabels, STRINGS.feeNotSetValueLabel,
      STRINGS.sellerTypeUnavailableNotice,
      STRINGS.postageServiceLabels, STRINGS.listingRefusalReasonLabels, STRINGS.listingRefusalShortLabels,
      STRINGS.changeRefusalReasonLabels, STRINGS.changeRefusalShortLabels, STRINGS.receiveLabels,
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
