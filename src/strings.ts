// Typed accessor for strings.json — the single source of truth for Curio's shared copy and
// terminology. Import STRINGS from here; never re-type a label inline, and never re-implement
// this vocabulary in a consuming repo (that's exactly the drift this package exists to prevent —
// see README.md "Why this exists").
import raw from "./strings.json" with { type: "json" };

export const STRINGS = raw;

export type PhysicalCardLifecycleStatus = keyof typeof STRINGS.statusLabels.physicalCardLifecycle;
export type LegacyCardStatus = keyof typeof STRINGS.statusLabels.legacyCardStatus;
export type RecommendedRoute = keyof typeof STRINGS.recommendationRouteLabels;
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
export type Condition = keyof typeof STRINGS.conditionLabels;
export type PriceSource = keyof typeof STRINGS.priceSourceLabels;
export type ErrorCopyKey = keyof typeof STRINGS.errorCopy;
export type EmptyCopyKey = keyof typeof STRINGS.emptyCopy;
