# Changelog

## v0.1.1 — 2026-08-10

iOS-cowork follow-up after wiring `@curio/tokens`/`@curio/copy` (CC-1/CC-2): 4 domain error strings
iOS needed had no shared equivalent, so they'd have stayed local, hand-authored copy that could
drift from web. None of these had existing deliberately-authored web copy to extract verbatim —
web's own current fallbacks for these cases are raw technical strings ("Identification failed",
"Failed to load repricing flags") that don't follow the established "Couldn't X — try again" voice
(the same pattern `saveFailed`/`couldNotUpdate`/`couldNotLoadGames` already use), so these are
authored fresh to that pattern rather than carried forward as-is — matching how the "please"
violations were handled in v0.1.0, not a deviation from the extraction discipline.

- `errorCopy.identifyFailed` — "Couldn't identify this card — try again."
- `errorCopy.recommendationLoadFailed` — "Couldn't load pricing — try again."
- `errorCopy.repriceFailed` — "Couldn't reprice — try again."
- `errorCopy.ebayUnreachable` — "Couldn't reach eBay — try again."

No breaking changes — purely additive. `priceSourceLabels` (unchanged since v0.1.0) was also
confirmed against `RecommendResponse.priceSource`'s actual production value set
(`lib/price-providers.ts`'s `PricingResult.source` type in `pokemon-tool`) during this same
follow-up — the 5 keys here already match exactly, including the `cardmarket_proxy` underscore
(the one key that isn't hyphenated like the other 4 — that inconsistency is real, not a typo).

## v0.1.0 — 2026-08-09 (tagged 2026-08-10)

**Tagged.** iOS-cowork review of the Swift dictionary-based shape is complete — confirmed
correct, no changes requested. WORK-BACKLOG.md Packet CC-1 slice 1. Both `pokemon-tool` and
`curio-capture-ios` should pin to this tag (not the pre-tag commit `25ca79a`).

Initial release. Promotes `curio-shared`'s `canon/copy/strings.candidate.json` (landed 2026-08-08,
commit `a760155`) from a documented-but-unwired candidate to a real, pinnable package — same
pattern as `@curio/contracts`/`@curio/tokens`.

- `statusLabels` (legacy `CardStatus` + `PhysicalCard` lifecycle), `attentionQueueCtas`,
  `recommendationRouteLabels`, `conditionLabels`, `priceSourceLabels`, `actionVerbs`,
  `honestyCaveats`, `errorCopy`, `emptyCopy` — extracted from `pokemon-tool`, corrected at the
  source rather than carried forward: the 2 "please" voice-rule violations are gone, and
  `attentionQueueCtas`/`honestyCaveats` no longer bake in web-specific presentation ("→", " — ")
  — see README.md "Composing labels with platform-idiomatic decoration".
- One canonical `formatGBP`/`formatDate` en-GB spec (`src/format.ts` header comment), implemented
  identically in TS and Swift (`Sources/CurioCopy/Format.swift`), both tested against the same
  fixture pairs (`src/fixtures.json`) so the two can't silently diverge.
- Real, confirmed cross-platform drift this package is meant to close (verified directly against
  `curio-capture-ios` `main`, not assumed from the audit): route labels differ on 4/6
  (`list_single` web "List individually" vs iOS "List on its own"; `bundle` "Bundle" vs "Bundle
  with similar"; `bulk` "Bulk" vs "Bulk / job lot"; `hold` "Hold" vs "Hold for now" — `grade_review`
  and `do_not_list` already agreed). iOS's status pill renders the raw enum value
  (`CurioCaptureApp.swift:988`, `s.replacingOccurrences(of: "_", with: " ")` — no case
  conversion), so `READY_TO_LIST` displays as "READY TO LIST", not "Ready to list".
- Swift codegen design: dictionaries (`CurioCopy.RouteLabels.all[...]`), not per-key named
  constants — see `scripts/gen-swift.mjs`'s header comment for why.
- 17 TS tests (`npm test`) + 8 Swift tests (`swift test`) passing.

Was held per the packet's own coordination requirement ("coordinate the `@curio/copy` shape with
the iOS cowork before tagging") — same discipline as `curio-contracts` Packet 9's inline-image
contract. Review is done; the hold is lifted.
