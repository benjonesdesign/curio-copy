# Changelog

## v0.1.0 — 2026-08-09

**Not yet tagged — open for iOS review before tagging.** WORK-BACKLOG.md Packet CC-1 slice 1.

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

**Held per the packet's own coordination requirement** ("coordinate the `@curio/copy` shape with
the iOS cowork before tagging") — same discipline as `curio-contracts` Packet 9's inline-image
contract: open a PR, no tag, so iOS can review the shape before either side pins to it.
