// MUTATION-CHECKED 2026-10-25 (buying, quick scan, graded PSA, breakdown labels; curio-shared#60/#61 and the 19 Oct buying and quick-scan files): red against `breakdownLineLabels.max_buy` changed from "Most to pay" to "Max buy" (the label-by-line-key test), red against `breakdownLineLabels.packingEstimate` renamed to `packing_estimate` (the estimate-variant test), red against `buyResults.overSuffix` changed to " above" (the compose test), red against `quickScanPicker.supportThree` changed to say 'Two cards' (the picker test), red against `gradedAdd.doneNotVerifiedNoRecheckMiddle` losing 'won\u2019t list it as graded' (the honesty test), green against current.
// MUTATION-CHECKED 2026-10-19 (fee band inclusive, curio-shared#49): red against feeBusinessVatSupport's 'for £10 or less' changed back to 'under £10' (the fee-wording test); green against current.
// MUTATION-CHECKED 2026-10-19 (moneySettingsGaps + photoRemove, curio-shared#46/#47): red against feeBusinessVatValue's 12.8% changed to 13%, against bodyBase losing the 'can't be undone' sentence, against discardOneAfter losing its leading space, and against a {placeholder} put into loadFailedBody; green against current.
// MUTATION-CHECKED 2026-10-18 (photoStrip, curio-shared#44): red against ofJoiner losing its edge spaces (both composed-name tests), against positionPrefix changed to 'Picture ' (the position test), and against a {placeholder} put into previous (the placeholder test); green against current.
// MUTATION-CHECKED 2026-10-18 (moneySettings, curio-shared#43): red against confirmedByYouPrefix losing its trailing space (the composed confirmed-date test), against taxError changed to a 0-60 range (the ranges-match-the-route test), and against a {placeholder} put into savedCost (the placeholder test); green against current.
// MUTATION-CHECKED 2026-10-17 (gradedAdd typed-by-hand, curio-shared#39): red against typedIntroPrefix losing its trailing space, against typedDoneMiddle's sentence changed, and against typedOverline lower-cased; green against current.
// MUTATION-CHECKED 2026-10-17 (gradedAdd, curio-shared#38): red against certHintUnverifiedSuffix changed (the composed non-PSA hint test), against doneUnverifiedMiddle losing its trailing space (the composed done-line test), and against a {placeholder} put into certHintLabel (the placeholder test); green against current.
// MUTATION-CHECKED 2026-10-14 (change-card copy, curio-shared#35): red against target_not_found's sentence changed (the pinned sentence test), against a {placeholder} put into successToastPrefix (the picker placeholder test), and against resultCountManySuffix changed (the composed-sentence test); green against current.
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

  it("gradedSlab carries all 17 keys, iOS/Android-codified and picked, none dropped by accident", () => {
    expect(Object.keys(STRINGS.gradedSlab).sort()).toEqual(
      [
        "title", "captureButton", "scanningLabel", "verifyButton", "verifyingLabel",
        "psaSaysHeader", "subjectLabel", "gradeLabel", "yearLabel", "brandLabel",
        "cardNumberLabel", "certRowLabel", "confirmButton", "confirmFooterPsa",
        "certNotFoundBody", "verifyFailed", "scanFailed",
      ].sort(),
    );
  });

  it("no gradedSlab copy contains 'please' (voice rule)", () => {
    for (const [key, msg] of Object.entries(STRINGS.gradedSlab)) {
      expect(msg.toLowerCase().includes("please"), `gradedSlab.${key} contains "please"`).toBe(false);
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

  it("change refusals: both forms carry the contract's reasons, in its order, complete", () => {
    // InventoryChangeRefusalReason (curio-contracts @ 8691519): the first six. Then the two reasons
    // only ChangeCardRefusalReason adds (curio-contracts#36, change-card): target_not_found and
    // game_not_available. Complete: every reason has a sentence and a short form, so a client never
    // meets one with no label.
    const CONTRACT = ["live_on_ebay", "sold", "archived", "set_aside", "not_found", "write_failed", "target_not_found", "game_not_available"];
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

  it("the change-card refusals carry design's sentences (curio-shared#35)", () => {
    expect(STRINGS.changeRefusalReasonLabels.target_not_found).toBe("That card isn't in the catalogue any more. Search again to pick another.");
    expect(STRINGS.changeRefusalReasonLabels.game_not_available).toBe("Seek doesn't support that game yet, so it can't be chosen.");
    expect(STRINGS.changeRefusalShortLabels.target_not_found).toBe("Not in catalogue");
    expect(STRINGS.changeRefusalShortLabels.game_not_available).toBe("Game not supported");
  });

  it("changeCardPicker: plain strings, and every template split into a prefix and a suffix", () => {
    const P = STRINGS.changeCardPicker;
    // No placeholder anywhere (README: plain content, composed per platform).
    for (const [key, value] of Object.entries(P)) {
      expect(value, `${key} carries a placeholder`).not.toMatch(/[{}]/);
    }
    // The composed sentences equal design's templates exactly (curio-shared#35, copy-additions-2026-10-14).
    expect(`${P.noPriceSourceLinePrefix}Magic: The Gathering${P.noPriceSourceLineSuffix}`).toBe("Pricing for Magic: The Gathering is coming.");
    expect(`${P.successToastPrefix}District Mascot 158${P.successToastSuffix}`).toBe("Changed to District Mascot 158.");
    expect(`12${P.resultCountManySuffix}`).toBe("12 cards found");
    expect(`${P.emptySearchPrefix}charizrd${P.emptySearchSuffix}`).toBe("Nothing matches \u201ccharizrd\u201d. Try the number on the card, like 125/197.");
    expect(`Lorcana${P.gameComingSuffix}`).toBe("Lorcana \u00b7 coming");
    expect(P.resultCountOne).toBe("1 card found");
    expect(P.dialogTitle).toBe("Which card is it?");
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
    // Design's Settings "Your time" panel (curio-shared#43) is the PACKING-time and hourly-rate panel; its own intro says
    // "Price the time packing takes you". These exact keys are that panel's name, buttons and status lines, and the hourly
    // rate's help. Listed by path so any other "your time" anywhere still fails this guard.
    const PACKING_TIME_PANEL = new Set([
      "STRINGS.moneySettings.panelTime", "STRINGS.moneySettings.hourlyRateHelp", "STRINGS.moneySettings.saveTime",
      "STRINGS.moneySettings.savingTime", "STRINGS.moneySettings.savedTime", "STRINGS.moneySettings.failedTime",
    ]);
    (function walk(node: unknown, path: string): void {
      if (typeof node === "string") {
        if (PACKING_TIME_PANEL.has(path)) return;
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

  it("changeCardPicker: no placeholder, no please; decoration only where design wrote it or the split needs it", () => {
    // Two kinds of exemption, both by key and both stated:
    //  - `busy` and `searching` end in "…": that is design's in-progress wording ("Changing the card…"),
    //    kept verbatim (curio-shared#35), not list/arrow decoration.
    //  - every *Prefix / *Suffix key is one half of a template split around a {placeholder}, so a space or
    //    a quote at the edge IS the composition (" · coming", "Nothing matches “").
    const ELLIPSIS_KEYS = ["busy", "searching"];
    for (const [key, value] of Object.entries(STRINGS.changeCardPicker)) {
      expect(value, `${key} has a placeholder`).not.toMatch(/[{}]|%[@sd@]|\$\{/);
      expect(value.toLowerCase(), `${key} says please`).not.toContain("please");
      if (/(Prefix|Suffix)$/.test(key)) continue;
      expect(value, `${key} has stray edge whitespace`).not.toMatch(/^\s|\s$/);
      if (!ELLIPSIS_KEYS.includes(key)) {
        expect(value, `${key} carries leading or trailing decoration`).not.toMatch(/^[\s→—–…·-]|[\s→—–…-]$/);
      }
    }
  });
});

describe("gradedAdd: the graded add page's hint, done line and grade error (design, curio-shared#38)", () => {
  const G = STRINGS.gradedAdd;

  it("the keys are exactly design's fourteen (thirteen, plus the PSA no-re-check line of 24 Oct), and no value carries a placeholder or says please", () => {
    expect(Object.keys(G)).toEqual(["certHintLabel", "certHintPsa", "certHintUnverifiedSuffix", "doneUnverifiedMiddle", "doneUnverifiedSuffix", "gradeMissing",
      "typedIntroSuffix", "typedIntroPrefix", "typedOverline", "typedCertSupportSuffix", "typedCertSupportPrefix", "typedDoneMiddle", "typedDoneSuffix",
      "doneNotVerifiedNoRecheckMiddle"]);
    for (const [key, value] of Object.entries(G)) {
      expect(value, `${key} has a placeholder`).not.toMatch(/[{}]|%[@sd@]|\$\{/);
      expect(value.toLowerCase(), `${key} says please`).not.toContain("please");
    }
  });

  it("composes to design's sentences exactly (no template support: the client joins the parts)", () => {
    // hint (non-PSA) = certHintLabel + ' ' + {grader} + certHintUnverifiedSuffix
    expect(`${G.certHintLabel} CGC${G.certHintUnverifiedSuffix}`).toBe(
      "Found on the slab label. CGC has no public cert lookup, so Seek can't verify this. It never lists an unverified slab as graded.");
    // hint (PSA) = certHintLabel + ' ' + certHintPsa
    expect(`${G.certHintLabel} ${G.certHintPsa}`).toBe(
      "Found on the slab label. Verify with PSA to confirm the card and grade. Seek only lists a slab as graded once it is verified.");
    // done line (non-PSA) = {card} + doneUnverifiedMiddle + {grader} + doneUnverifiedSuffix
    expect(`Charizard 4/102${G.doneUnverifiedMiddle}BGS${G.doneUnverifiedSuffix}`).toBe(
      "Charizard 4/102 is in your inventory as a graded slab. The grade is read from the label, not checked with BGS, and the card is the one you chose. Seek never lists an unverified slab as graded.");
    expect(G.gradeMissing).toBe("Choose the grade printed on the slab label.");
  });

  it("typed by hand (D3b-AC8, curio-shared#39) composes to design's sentences exactly", () => {
    // intro = typedIntroPrefix + {grader} + typedIntroSuffix
    expect(`${G.typedIntroPrefix}CGC${G.typedIntroSuffix}`).toBe(
      "You typed this. CGC and the other graders have no public cert lookup, so check what you typed against the slab before it goes into your inventory.");
    expect(G.typedOverline).toBe("TYPED BY YOU \u00b7 NOT VERIFIED");
    // cert support = typedCertSupportPrefix + {grader} + typedCertSupportSuffix
    expect(`${G.typedCertSupportPrefix}BGS${G.typedCertSupportSuffix}`).toBe("Typed by you. BGS has no public lookup, so this is not verified");
    // done line = {card} + typedDoneMiddle + {grader} + typedDoneSuffix
    expect(`Charizard 4/102${G.typedDoneMiddle}CGC${G.typedDoneSuffix}`).toBe(
      "Charizard 4/102 is in your inventory as a graded slab. The grade and cert are as you typed them, not checked with CGC, and the card is the one you chose. Seek never lists an unverified slab as graded.");
  });

  it("edge whitespace only where the split needs it: the *Prefix, *Middle and *Suffix keys; the rest are clean", () => {
    // The *Prefix, *Middle and *Suffix keys are halves of a template split around {grader}/{card}, so a
    // space or comma at the edge IS the composition.
    for (const [key, value] of Object.entries(G)) {
      if (/(Prefix|Suffix|Middle)$/.test(key)) continue;
      expect(value, `${key} has stray edge whitespace`).not.toMatch(/^\s|\s$/);
    }
  });

  it("never offers a manual confirm (D3b-AC5): no copy mentions confirming the details", () => {
    for (const [key, value] of Object.entries(G)) expect(value.toLowerCase(), `${key} mentions confirming`).not.toMatch(/confirm (the |these )?details|manually/);
  });
});

describe("moneySettings: the web Settings money section (design, curio-shared#43)", () => {
  const M = STRINGS.moneySettings;
  // Halves of a composition: a space at the edge IS the composition (confirmedByYouPrefix + date, clearNamePrefix + label,
  // fieldNotSavedReason + the server's words).
  const COMPOSED = new Set(["confirmedByYouPrefix", "clearNamePrefix", "fieldNotSavedReason"]);

  it("has design's 76 keys, none carrying a placeholder, and none says please", () => {
    expect(Object.keys(M)).toHaveLength(76);
    for (const [key, value] of Object.entries(M)) {
      expect(value, `${key} has a placeholder`).not.toMatch(/[{}]|%[@sd@]|\$\{/);
      expect(value.toLowerCase(), `${key} says please`).not.toContain("please");
    }
  });

  it("edge whitespace only on the three composed halves; every other value is clean", () => {
    for (const [key, value] of Object.entries(M)) {
      if (COMPOSED.has(key)) { expect(value, `${key} should end with a space`).toMatch(/ $/); continue; }
      expect(value, `${key} has stray edge whitespace`).not.toMatch(/^\s|\s$/);
    }
  });

  it("composes to design's sentences exactly", () => {
    // A confirmed answer = confirmedByYouPrefix + {date}.
    expect(`${M.confirmedByYouPrefix}18 Oct 2026`).toBe("Confirmed by you \u00b7 18 Oct 2026");
    // A field's Clear button: accessible name = clearNamePrefix + the field's label.
    expect(`${M.clearNamePrefix}${M.hourlyRateLabel}`).toBe("Clear Your hourly rate (optional)");
    // A server reason beside a field = fieldNotSavedReason + the server's words (the 400 `fields` sentence).
    expect(`${M.fieldNotSavedReason}Enter a margin from 0% to 95% of the selling price.`).toBe("Not saved. Enter a margin from 0% to 95% of the selling price.");
  });

  it("the not-set help promises \"Not set\", never \u00a30, and the status word matches the fee's not-set value", () => {
    expect(M.statusNotSet).toBe(STRINGS.feeNotSetValueLabel.value);
    expect(M.sellerTypeNotSetHelp).toContain("\u201cNot set\u201d, never \u00a30");
    expect(M.vatNotSetHelp).toContain("\u201cNot set\u201d, never \u00a30");
  });

  it("the packing-time panel says it is about packing, so the 'no listing time' guard's exemption is honest", () => {
    expect(M.panelTimeIntro).toContain("time packing takes you");
    expect(M.packMinutesLabel).toContain("pack a parcel");
  });

  it("the error sentences state the same ranges PATCH /api/profile enforces (tax 1-60, margin 0-95, minutes 1-60, handling 1-3)", () => {
    expect(M.taxError).toContain("between 1% and 60%");
    expect(M.marginError).toContain("between 0% and 95%");
    expect(M.packMinutesError).toContain("1 to 60");
    expect(M.handlingTimeError).toContain("1 to 3");
  });

  it("each panel has a Save, a Saving, a saved line and a failed line, and the failed body promises nothing was changed", () => {
    for (const panel of ["Cost", "Time", "Dispatch", "Buying"]) {
      for (const prefix of ["save", "saving", "saved", "failed"]) expect(M, `${prefix}${panel}`).toHaveProperty(`${prefix}${panel}`);
    }
    expect(M.failedBody).toBe("Nothing was changed. Everything you typed is still here. Try again.");
  });
});

describe("photoStrip: the card-detail photo thumbnail strip (design, curio-shared#44)", () => {
  const P = STRINGS.photoStrip;

  it("has design's five keys, none carrying a placeholder, and none says please", () => {
    expect(Object.keys(P)).toEqual(["groupName", "previous", "next", "ofJoiner", "positionPrefix"]);
    for (const [key, value] of Object.entries(P)) {
      expect(value, `${key} has a placeholder`).not.toMatch(/[{}]|%[@sd@]|\$\{/);
      expect(value.toLowerCase(), `${key} says please`).not.toContain("please");
    }
  });

  it("composes to design's sentences exactly", () => {
    // thumbnail name = {side} + ofJoiner + {card}
    expect(`Close-up 1${P.ofJoiner}Charizard ex`).toBe("Close-up 1 of Charizard ex");
    expect(`Front${P.ofJoiner}Charizard ex`).toBe("Front of Charizard ex");
    // position announcement = positionPrefix + {n} + ofJoiner + {total}
    expect(`${P.positionPrefix}3${P.ofJoiner}10`).toBe("Photo 3 of 10");
    expect(P.groupName).toBe("Photos");
    expect(P.previous).toBe("Previous photos");
    expect(P.next).toBe("Next photos");
  });

  it("edge whitespace only on the two composed halves; the rest are clean", () => {
    for (const [key, value] of Object.entries(P)) {
      if (key === "ofJoiner") { expect(value).toMatch(/^ .* $/); continue; }
      if (key === "positionPrefix") { expect(value).toMatch(/ $/); continue; }
      expect(value, `${key} has stray edge whitespace`).not.toMatch(/^\s|\s$/);
    }
  });
});

describe("moneySettingsGaps and photoRemove: Settings fee rows, discard dialog, load failure and Remove photo (design, curio-shared#46/#47)", () => {
  const G = STRINGS.moneySettingsGaps;
  const R = STRINGS.photoRemove;
  const HALVES = /(Before|Middle|After|End)$/;

  it("has design's 22 + 8 keys; no placeholder, none says please", () => {
    expect(Object.keys(G)).toHaveLength(22);
    expect(Object.keys(R)).toEqual(["button", "confirmTitle", "confirmAction", "confirmCancel", "bodyBase", "bodyListing", "bodyOrder", "toast"]);
    for (const [group, g] of [["moneySettingsGaps", G], ["photoRemove", R]] as const) {
      for (const [key, value] of Object.entries(g)) {
        expect(value, `${group}.${key} has a placeholder`).not.toMatch(/[{}]|%[@sd@]|\$\{/);
        expect(value.toLowerCase(), `${group}.${key} says please`).not.toContain("please");
      }
    }
  });

  it("the fee rows quote the fee rule exactly (pokemon-tool pins these numbers to lib/economics/fees.ts)", () => {
    expect(G.feeRowLabel).toBe("eBay final value fee");
    expect(G.feePrivateValue).toBe("None");
    expect(G.feeBusinessVatValue).toBe("12.8% + 0.35% + \u00a30.40");
    expect(G.feeBusinessNoVatValue).toBe("12.8% + 0.35% + \u00a30.40, plus VAT");
    // The low band and the VAT rate appear in the support lines.
    expect(G.feeBusinessVatSupport).toContain("\u00a30.30 instead of \u00a30.40 for \u00a310 or less");
    expect(G.feeBusinessNoVatSupport).toContain("\u00a30.30 instead of \u00a30.40 for \u00a310 or less");
    expect(G.feeBusinessNoVatSupport).toContain("20% VAT");
  });

  it("the discard body composes to design's sentences exactly (one, two, three, many)", () => {
    expect(`${G.discardOneBefore}hourly rate${G.discardOneMiddle}\u00a312.00${G.discardOneAfter}\u00a315.00${G.discardOneEnd}`).toBe(
      "Your new hourly rate of \u00a312.00 isn\u2019t saved. The panel goes back to \u00a315.00.");
    expect(`${G.discardTwoBefore}tax${G.discardTwoMiddle}packing${G.discardTwoAfter}`).toBe("Your changes to tax and packing aren\u2019t saved. The panel goes back to what you last saved.");
    expect(`${G.discardTwoBefore}tax, hourly rate${G.discardTwoMiddle}packing${G.discardTwoAfter}`).toBe("Your changes to tax, hourly rate and packing aren\u2019t saved. The panel goes back to what you last saved.");
    expect(`${G.discardManyBefore}4${G.discardManyAfter}`).toBe("Your changes to 4 settings aren\u2019t saved. The panel goes back to what you last saved.");
  });

  it("the Remove photo body composes: base alone, with the listing sentence, with the order sentence, with both", () => {
    expect(R.bodyBase).toBe("This takes the photo off this copy. It can\u2019t be undone.");
    expect(R.bodyBase + R.bodyListing).toBe("This takes the photo off this copy. It can\u2019t be undone. Your eBay listing keeps the pictures it was published with until you revise or relist it.");
    expect(R.bodyBase + R.bodyOrder).toContain("It can\u2019t be undone. Photos stay in order: front, back, then close-ups.");
    expect((R.bodyBase + R.bodyListing + R.bodyOrder).split(". ").length).toBeGreaterThan(3);
    expect(R.confirmTitle).toBe("Remove this photo?");
    expect(R.toast).toBe("Photo removed.");
  });

  it("states what removal does and does not do: no undo is offered", () => {
    expect(Object.keys(R).join()).not.toMatch(/undo/i);
    expect(R.bodyBase).toContain("can\u2019t be undone");
  });

  it("edge whitespace only on the composed halves (discard *Before/*Middle/*After/*End, photoRemove bodyListing/bodyOrder)", () => {
    for (const [key, value] of Object.entries(G)) {
      if (/^discard/.test(key) && HALVES.test(key)) continue;
      expect(value, `${key} has stray edge whitespace`).not.toMatch(/^\s|\s$/);
    }
    for (const [key, value] of Object.entries(R)) {
      if (key === "bodyListing" || key === "bodyOrder") { expect(value).toMatch(/^ /); continue; }
      expect(value, `${key} has stray edge whitespace`).not.toMatch(/^\s|\s$/);
    }
  });
});

describe("buyResults, buyListing, quickScan*, breakdownLineLabels, mostToPay and gradedAdd's no-recheck line (design: 19 Oct buying and quick-scan files, curio-shared#60/#61)", () => {
  const B = STRINGS.buyResults;
  const L = STRINGS.buyListing;
  const LINES = STRINGS.breakdownLineLabels;

  it("has design's key counts; no placeholder, none says please", () => {
    expect(Object.keys(B)).toHaveLength(8);
    expect(Object.keys(L)).toHaveLength(6);
    expect(Object.keys(STRINGS.quickScanResult)).toEqual(["checkAnother"]);
    expect(Object.keys(STRINGS.quickScanPicker)).toEqual(["supportTwo", "supportThree"]);
    expect(Object.keys(STRINGS.quickScanNotReadEnough)).toEqual(["coach"]);
    expect(Object.keys(LINES)).toHaveLength(12);
    expect(Object.keys(STRINGS.mostToPay)).toEqual(["headlineLabel"]);
    const groups = { buyResults: B, buyListing: L, quickScanResult: STRINGS.quickScanResult, quickScanPicker: STRINGS.quickScanPicker,
      quickScanNotReadEnough: STRINGS.quickScanNotReadEnough, breakdownLineLabels: LINES, mostToPay: STRINGS.mostToPay };
    for (const [group, g] of Object.entries(groups)) {
      for (const [key, value] of Object.entries(g)) {
        expect(value, `${group}.${key} has a placeholder`).not.toMatch(/[{}]|%[@sd@]|\$\{/);
        expect(value.toLowerCase(), `${group}.${key} says please`).not.toContain("please");
        expect(key.startsWith("$"), `${group}.${key} is a design annotation, not copy`).toBe(false);
      }
    }
  });

  it("the Against it column composes: under, over, and 'Can\u2019t say yet' (the server's sign decides, the page never subtracts)", () => {
    expect(B.columnAgainstIt).toBe("Against it");
    expect(`\u00a312${B.underSuffix}`).toBe("\u00a312 under");
    expect(`\u00a35${B.overSuffix}`).toBe("\u00a35 over");
    expect(B.cantSayYet).toBe("Can\u2019t say yet");
    expect(`\u00a312${B.pillUnderSuffix}`).toBe("\u00a312 under the most to pay");
    expect(`\u00a35${B.pillOverSuffix}`).toBe("\u00a35 over the most to pay");
    expect(`${B.chipUnderPrefix}4`).toBe("Under the most to pay \u00b7 4");
    expect(B.overNoticeBody).toBe("The most to pay is worked from asking prices, so it is a ceiling, not a forecast.");
  });

  it("the appraise-a-listing ask is ONE box, 'Item + postage', and an auction bids where Buy It Now offers", () => {
    expect(L.askLabel).toBe("Item + postage");
    expect(L.askPlaceholder).toBe("What they\u2019re asking, with postage");
    expect(L.askMissing).toBe("Enter what they\u2019re asking, with postage, to see how it compares.");
    expect(`${L.bidCuePrefix}40`).toBe("Bid up to \u00a340");
    expect(`${L.offerCuePrefix}40`).toBe("Offer up to \u00a340");
  });

  it("Quick Scan: the picker support says how many cards share the art, and the coach asks for the bottom line", () => {
    expect(STRINGS.quickScanResult.checkAnother).toBe("Check another card");
    expect(STRINGS.quickScanPicker.supportTwo).toBe("Two cards share this art. Tap the one in your hand.");
    expect(STRINGS.quickScanPicker.supportThree).toBe("Three cards share this art. Tap the one in your hand.");
    expect(STRINGS.quickScanNotReadEnough.coach).toBe("Hold the card so the bottom line is in the guide");
  });

  it("graded: a PSA slab saved with no re-check scheduled says it is not verified and will not be listed as graded", () => {
    const mid = STRINGS.gradedAdd.doneNotVerifiedNoRecheckMiddle;
    expect(mid).toBe(" is in your inventory as a graded slab. The grade isn\u2019t verified yet, so Seek won\u2019t list it as graded until it is.");
    expect(`PSA 10 Charizard${mid}`.startsWith("PSA 10 Charizard is in your inventory")).toBe(true);
  });

  it("breakdown line labels are keyed by the SERVER's line key, so any client renders them; estimates have their own keys", () => {
    expect(LINES).toMatchObject({
      sale_price: "Sale price", ebay_fee: "eBay fee", fee_vat: "VAT on the fee", packing: "Packing", postage: "Postage",
      packing_time: "Packing time", target_margin: "Your margin", tax_set_aside: "Tax set aside", max_buy: "Most to pay", you_receive: "You receive",
    });
    expect(LINES.packingEstimate).toBe("Packing (estimate)");
    expect(LINES.packingTimeEstimate).toBe("Packing time (estimate)");
    // The buying total and the headline on a screen with no listing read the same words.
    expect(STRINGS.mostToPay.headlineLabel).toBe(LINES.max_buy);
  });
});
