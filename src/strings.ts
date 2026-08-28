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
export type Condition = keyof typeof STRINGS.conditionLabels;
export type PriceSource = keyof typeof STRINGS.priceSourceLabels;
export type ErrorCopyKey = keyof typeof STRINGS.errorCopy;
export type EmptyCopyKey = keyof typeof STRINGS.emptyCopy;
