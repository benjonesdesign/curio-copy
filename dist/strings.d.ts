export declare const STRINGS: {
    $schema: string;
    statusLabels: {
        legacyCardStatus: {
            draft: string;
            in_stock: string;
            listed: string;
            sold: string;
            reconciled: string;
            returned: string;
            archived: string;
        };
        physicalCardLifecycle: {
            NEEDS_ID_REVIEW: string;
            NEEDS_CONDITION: string;
            NEEDS_DECISION: string;
            READY_TO_LIST: string;
            EBAY_DRAFT: string;
            LISTED: string;
        };
    };
    attentionQueueCtas: {
        NEEDS_ID_REVIEW: string;
        NEEDS_CONDITION: string;
        NEEDS_DECISION: string;
        READY_TO_LIST: string;
    };
    recommendationRouteLabels: {
        list_single: string;
        bundle: string;
        bulk: string;
        hold: string;
        grade_review: string;
        restoration_review: string;
        do_not_list: string;
    };
    saleVenueLabels: {
        ebay: string;
        vinted: string;
        tcgplayer: string;
        cardmarket: string;
        whatnot: string;
        facebook: string;
        show: string;
        local: string;
        buylist: string;
        trade: string;
        other: string;
    };
    dispositionOnlyLabels: {
        keep: string;
        bundle: string;
    };
    conditionLabels: {
        NM: string;
        LP: string;
        MP: string;
        HP: string;
        DMG: string;
        Graded: string;
    };
    priceSourceLabels: {
        "ebay-uk-sold": string;
        cardmarket_proxy: string;
        "poketrace-ebay": string;
        "pokemontcg-cardmarket": string;
        "pokemontcg-tcgplayer": string;
    };
    actionVerbs: {
        confirmAndNext: string;
        addToInventory: string;
        retry: string;
        cancel: string;
        edit: string;
        save: string;
    };
    honestyCaveats: {
        gradeEvLowConfidence: string;
        gradeEvNormalConfidence: string;
        conditionEstimateOnly: string;
    };
    errorCopy: {
        genericUnexpected: string;
        networkError: string;
        couldNotLoadGames: string;
        couldNotUpdate: string;
        couldNotConnect: string;
        couldNotLoadInventory: string;
        saveFailed: string;
        couldNotAutofillAddress: string;
        couldNotImport: string;
        couldNotScoreListing: string;
        notSignedIn: string;
        identifyFailed: string;
        recommendationLoadFailed: string;
        repriceFailed: string;
        ebayUnreachable: string;
    };
    emptyCopy: {
        dashboardHome: string;
        searchNoMatch: string;
        acquisitionDetail: string;
        dashboardEmpty: string;
        bulkPublish: string;
        showDetail: string;
        bundleDetail: string;
    };
    routeReasonLabels: {
        below_bulk_floor: string;
        net_below_minimum: string;
        grade_worth_reviewing: string;
        thin_market: string;
        bundle_lot_available: string;
        sound_single_listing: string;
    };
    alternativeReasonLabels: {
        net_negative_after_costs: string;
        bundle_shares_postage: string;
        list_ungraded_instead: string;
        list_now_accept_slower: string;
        list_alone_instead: string;
    };
    degradedReasonLabels: {
        no_sale_count: string;
        fees_unknown: string;
        compatible_count_unknown: string;
    };
    decisionUnavailableLabels: {
        identity_unresolved: string;
        no_market_value: string;
        pricing_unavailable: string;
    };
    assumptionLabels: {
        channel: string;
        seller_type: string;
        vat_registered: string;
        condition: string;
        postage: string;
        packaging: string;
        tax_rate: string;
        cost_basis: string;
    };
    editionAmbiguityLabels: {
        first_edition_shadowless_unlimited: string;
        first_edition_unlimited: string;
    };
    editionAmbiguityNoPriceLabels: {
        first_edition_shadowless_unlimited: string;
        first_edition_unlimited: string;
    };
};
export type PhysicalCardLifecycleStatus = keyof typeof STRINGS.statusLabels.physicalCardLifecycle;
export type LegacyCardStatus = keyof typeof STRINGS.statusLabels.legacyCardStatus;
export type RecommendedRoute = keyof typeof STRINGS.recommendationRouteLabels;
/** WHERE MONEY ACTUALLY CHANGED HANDS — curio-shared decisions/0030. The vocabulary behind
 *  `physical_cards.sale_platform`, `cards.sale_platform`, `outcome_events.sale_platform` and
 *  `bundles.channel`, all of which previously held free display strings or a disagreeing slug list.
 *
 *  `local` is the one that mattered: web offered "Local / cash" on one screen and "Local sale" on
 *  another, so a sale recorded on one did not match a filter on the other. */
export type SaleVenue = keyof typeof STRINGS.saleVenueLabels;
/** WHAT THE PLAN FOR A CARD IS — `physical_cards.allocation_channel`. A superset of SaleVenue,
 *  and it is DEFINED from it rather than listed beside it, which is the point: the two lists
 *  drifted apart precisely because they were maintained separately.
 *
 *  The two extras are the outcomes that are NOT sales. `keep` is the decision not to sell — a
 *  sale venue of `keep` is incoherent. `bundle` is "this card goes into a lot"; the lot then sells
 *  somewhere, and `bundles.channel` records THAT. */
export type CardDisposition = SaleVenue | keyof typeof STRINGS.dispositionOnlyLabels;
/** Every disposition's label, composed rather than duplicated — 13 entries from two sources, so a
 *  venue added tomorrow is a valid disposition the same day with nobody remembering to add it
 *  twice. */
export declare const dispositionLabels: Record<CardDisposition, string>;
/** Reason codes from @curio/contracts' `decide` module. The engine returns codes and never
 *  English — see decisions/0024. This is where the English lives, for all three platforms. */
export type RouteReason = keyof typeof STRINGS.routeReasonLabels;
export type AlternativeReason = keyof typeof STRINGS.alternativeReasonLabels;
export type DegradedReason = keyof typeof STRINGS.degradedReasonLabels;
/** Why a Quick Scan returned no decision. Two ordinary results and one OUTAGE — the copy holds
 *  that distinction, because a client showing the same tone for "no price for this card" and
 *  "our pricing is down" tells the seller the wrong thing about which it is. */
export type DecisionUnavailable = keyof typeof STRINGS.decisionUnavailableLabels;
/** What the engine FILLED IN because the seller hadn't said — @curio/contracts'
 *  `DecisionAssumptionCodeSchema`. Distinct from `DegradedReason`, which says what was MISSING:
 *  a decision can be entirely un-degraded and still rest on assumptions.
 *
 *  Every string begins "Assumed" deliberately. W21 7.1 requires the default sales channel to be
 *  "labelled as an assumption, never presented as a choice the seller made", and a label reading
 *  "Selling on eBay" would read as a setting the seller chose. That requirement is really true of
 *  every entry here, so the whole set is phrased to satisfy it rather than just the one code.
 *
 *  The assumption's `value`/`valueGbp` are formatted separately by each client in its own locale;
 *  these labels stand alone and do not interpolate one. `channel` names eBay directly because it
 *  is the only channel that can currently be assumed — `direct` is only ever a stated choice, so
 *  it can never appear in this list. */
export type AssumptionCode = keyof typeof STRINGS.assumptionLabels;
/** What a price CANNOT distinguish — the WOTC sets where 1st Edition / Shadowless / Unlimited
 *  share a name, set and number and differ by an order of magnitude, while nothing in our pipeline
 *  models edition at all.
 *
 *  Written to prompt an ACTION, not to hedge. "Check the stamp before you sell" is the difference
 *  between a seller checking and a seller finding out afterwards — and this is the one money bug
 *  that costs them the card rather than the margin. Both strings name the thing to look at, since
 *  a caveat a seller can't act on is just noise on the number. */
export type EditionAmbiguity = keyof typeof STRINGS.editionAmbiguityLabels;
/**
 * The SAME disclosure, worded for when there is no price on screen.
 *
 * `editionAmbiguityLabels` opens "This price can't tell..." and iOS rightly gated it on a price
 * existing — the note was appearing above a dash and talking about a number that wasn't there.
 *
 * But gating it loses the warning exactly where it matters most. A vintage Base Charizard our
 * pricing CANNOT SEE is the card a seller is most likely to sell blind, and the ambiguity is a
 * fact about the CARD, not about the price. So this set presupposes no number, and a client shows
 * it instead of hiding the disclosure — never nothing.
 *
 * Same codes, same action ("check the stamp"), no presupposed price.
 */
export type EditionAmbiguityNoPrice = keyof typeof STRINGS.editionAmbiguityNoPriceLabels;
export type Condition = keyof typeof STRINGS.conditionLabels;
export type PriceSource = keyof typeof STRINGS.priceSourceLabels;
export type ErrorCopyKey = keyof typeof STRINGS.errorCopy;
export type EmptyCopyKey = keyof typeof STRINGS.emptyCopy;
