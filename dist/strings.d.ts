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
};
export type PhysicalCardLifecycleStatus = keyof typeof STRINGS.statusLabels.physicalCardLifecycle;
export type LegacyCardStatus = keyof typeof STRINGS.statusLabels.legacyCardStatus;
export type RecommendedRoute = keyof typeof STRINGS.recommendationRouteLabels;
/** Reason codes from @curio/contracts' `decide` module. The engine returns codes and never
 *  English — see decisions/0024. This is where the English lives, for all three platforms. */
export type RouteReason = keyof typeof STRINGS.routeReasonLabels;
export type AlternativeReason = keyof typeof STRINGS.alternativeReasonLabels;
export type DegradedReason = keyof typeof STRINGS.degradedReasonLabels;
export type Condition = keyof typeof STRINGS.conditionLabels;
export type PriceSource = keyof typeof STRINGS.priceSourceLabels;
export type ErrorCopyKey = keyof typeof STRINGS.errorCopy;
export type EmptyCopyKey = keyof typeof STRINGS.emptyCopy;
