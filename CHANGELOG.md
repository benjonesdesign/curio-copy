# Changelog

## v0.1.9 — the sale-venue vocabulary

**`saleVenueLabels` (11) and `dispositionOnlyLabels` (2)** — curio-shared
`decisions/0030-sale-venue-and-disposition.md`.

"Where a card went" was spelled **seven** different ways in `pokemon-tool` and its database: two
customer-facing dropdowns that disagreed, two CHECKed slug lists that disagreed with each other,
and three unconstrained `text` columns holding display strings. `local` is the one that bit —
"Local / cash" on one screen and "Local sale" on another, so a sale recorded on one did not match
a filter on the other.

**Disposition is composed, not duplicated.** `dispositionLabels` is
`{...saleVenueLabels, ...dispositionOnlyLabels}` and `CardDisposition` is
`SaleVenue | keyof dispositionOnlyLabels`, so a venue added tomorrow is a valid disposition the
same day with nobody remembering to add it twice — the two lists drifted apart precisely because
they were maintained separately.

The two extras are the outcomes that are **not sales**: `keep` (the decision not to sell — a venue
of "keep" is incoherent) and `bundle` (the lot then sells somewhere, and `bundles.channel` records
*that*). A test pins that set to exactly those two, because it is the whole argument for two
vocabularies rather than one.

`TCGplayer` is spelled with a lowercase `p`, which is the brand's own rendering; `pokemon-tool`
had `TCGPlayer` in both dropdowns.

### Where this file's history lives

⚠️ **`curio-shared/versions.json` is the authoritative record of what this package has shipped.
This file is a transcription of it.**

v0.1.6, v0.1.7 and v0.1.8 were tagged with no entry here, and `package.json` sat at `0.1.5`
throughout. Nothing broke — consumers pin by git tag (`#v0.1.8`) and `copy-check.mjs` verifies the
installed *commit* against the pinned tag, never the version field — but this file was three
releases stale while canonical was current.

**The cause is structural, not forgetfulness.** `versions.json` is what gets updated during a
release sitting, because that is what consumers read; a package's own changelog is not on that
path. Two records of one fact, one of them maintained. So the maintained one is authoritative and
this one is derived from it — the same shape as `dispositionLabels` being composed from
`saleVenueLabels` rather than kept in parallel.

The three entries below are **transcribed** from that note, not reconstructed. `git log
v0.1.5..v0.1.8` is the code-level record.

`src/changelog-coverage.test.ts` now fails when a git tag has no heading here.

## v0.1.8 — `editionAmbiguityNoPriceLabels`

*Transcribed 2026-09-03 from `curio-shared/versions.json` — see "Where this file's history lives".*

The disclosure survives having no price. iOS gated the warning on a price existing, because the
wording opened *"This price can't tell…"* above a dash. **The gate was right for that wording and
wrong for the disclosure**: a vintage Base Charizard our pricing *cannot see* is the card a seller
is most likely to sell blind. Same codes, no presupposed number.

## v0.1.7 — `editionAmbiguityLabels`

*Transcribed from `curio-shared/versions.json`.*

Say what the price cannot distinguish. A Base Set Charizard exists as 1st Edition, Shadowless and
Unlimited — thousands vs hundreds of pounds — and **nothing in the pricing pipeline models
edition**: no catalogue column, no `PriceLookupParams` field, and the cache key is
`name|set_name|card_number|condition`, so two editions share a cache entry. The number is wrong in
both directions, and the undervaluing one costs a seller **the card** rather than the margin.

## v0.1.6 — `assumptionLabels`

*Transcribed from `curio-shared/versions.json`.*

`/api/decide`'s `assumptions` is the typed successor to `/api/recommend`'s English
`assumptions: string[]` — the whole point being that the wording lives *here*, so one repo owns
English for three platforms (ADR 0024). The codes shipped and the labels never did, so every client
had to invent its own. W21 7.1 made it urgent: an assumed sales channel *"must be labelled as an
assumption, never presented as a choice the seller made"*, and you cannot label it without a label —
which is why every string in the set begins "Assumed".

Also fixed the **mechanism**: both generators listed their label sets in a hand-written map, so a
new key reached TypeScript only, a fresh regeneration matched the committed file byte for byte, and
`check-drift` reported green. It caught a stale output and was blind to a missing one.

## v0.1.5
- **`decisionUnavailableLabels`** — the FOURTH shared enum from `@curio/contracts`' `decide` module,
  missed in v0.1.3. `routeReasonLabels`, `alternativeReasonLabels` and `degradedReasonLabels` are
  here precisely so three platforms can't invent three sentences for one code; this one wasn't, so
  iOS wrote them locally with the deviation named — the right interim and the wrong permanent state.

  The copy holds a distinction the codes carry: `identity_unresolved` and `no_market_value` are
  ordinary results about a card, and `pricing_unavailable` is an **outage**. A client showing the
  same tone for "no price for this card" and "our pricing is down" tells the seller the wrong thing
  about which it is — so only the outage invites a retry, and a test asserts that.


## v0.1.4
- **npm now ships the Kotlin target too.** v0.1.3 added it and the changelog said so, but
  `package.json`'s `files` list predated it — `["dist", "Sources", "Package.swift"]` — so an
  `npm install` saw Swift only. **The target was genuinely in the tag**; the npm package was the
  incomplete view. That cost a round trip to establish, which is the argument for the next item.

- **Release-integrity assertions**, mirroring `curio-contracts`': `npm run check` now fails if
  `files` omits a generated tree, or if HEAD is tagged at a version `package.json` disagrees with.
  A changelog claiming an output the package doesn't ship is the same "assertion pointing at
  something that isn't there" defect the code-level audits kept finding, one layer up.

- ⚠️ **Android still cannot consume this package, and the Kotlin target is not why.** This repo is
  **private**, and JitPack cannot see it (`Repo not found or no token provided`), while
  `curio-contracts` and `curio-tokens` — which Android consumes fine — are **public**. Correct
  Kotlin, correct tag, no delivery path. Making this repo public, matching the other two, is the
  fix and it needs Ben.


## v0.1.3
Two gaps, both found by client lanes hitting a wall the package caused.

- **Reason-code labels for `@curio/contracts`' `decide` module** — `routeReasonLabels`,
  `alternativeReasonLabels`, `degradedReasonLabels`.

  The decision engine returns **codes and never English**, deliberately (`decisions/0024`) — so
  that the server does not own copy for three platforms. But no English existed anywhere for those
  codes, which meant iOS could not move the decision hero to `/api/decide` without inventing it in
  Swift, which is exactly what the contract forbids. So the hero stayed on `/api/recommend` and its
  English `why` could not retire. **The refusal was correct; the gap was ours.**

  Degraded labels deliberately say what was MISSING, not sorry. A degraded decision is still the
  best available call, and the seller is owed the reason rather than an apology.

- **A Kotlin target.** This package had none, so Android could not consume it at all and was
  stubbing labels behind a single accessor — about to hit the identical wall on the value half it
  is building now.

  `scripts/gen-kotlin.mjs` mirrors `gen-swift.mjs` exactly: same groups, same order, same design
  choice of one `all` map per group keyed by the RAW WIRE VALUE rather than a constant per key
  (keys arrive as `"NEEDS_ID_REVIEW"`, `"list_single"`, `"ebay-uk-sold"`, and converting those to
  identifiers is lossy and collision-prone). Gradle build mirrors `curio-contracts`' so JitPack
  serves both the same way.

- **The drift guard now covers BOTH generated trees.** It checked only Swift, so Kotlin could have
  drifted silently while the guard reported green — the "looks like enforcement" failure
  `decisions/0026` records against this project's own conformance claims.

- **This repo has CI for the first time**, running the TS tests, the drift guard, and
  `./gradlew test` on a pinned JDK 21. `StringsTest` asserts every `decide` reason code has a
  label, because otherwise "Android can consume @curio/copy" is a claim about a file existing.


## v0.1.2 — 2026-08-10

iOS-cowork found the shared `errorCopy.identifyFailed` (added in v0.1.1) undersold a common,
often-transient cause: iOS had a richer local string ("...its photos may still be uploading, or
try a clearer shot.") that got dropped when switching to the shared key. Checked whether that
cause is real on web too before enriching the shared copy, rather than taking the iOS framing at
face value — it is: `app/add/multiple/page.tsx`'s batch flow silently drops any photo whose
Supabase upload hasn't resolved yet (`.filter(Boolean)` on `supabaseUrl`) and calls `/api/identify`
anyway, so a still-uploading photo is a genuine, non-iOS-specific identify-failure cause.

- `errorCopy.identifyFailed`: "Couldn't identify this card — try again." → "Couldn't identify this
  card yet — its photos may still be uploading, or try a clearer shot."

No breaking changes — value-only change to an existing key.

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
