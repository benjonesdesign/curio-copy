// Typed accessor for strings.json — the single source of truth for Curio's shared copy and
// terminology. Import STRINGS from here; never re-type a label inline, and never re-implement
// this vocabulary in a consuming repo (that's exactly the drift this package exists to prevent —
// see README.md "Why this exists").
import raw from "./strings.json" with { type: "json" };
export const STRINGS = raw;
