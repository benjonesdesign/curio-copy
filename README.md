# @curio/copy

The single source for Curio's shared **copy and terminology** — status labels, recommendation
route labels, condition labels, price-source labels, action verbs, grade-EV/condition honesty
caveats, error copy, empty-state copy, and one canonical en-GB currency/date formatting spec.
Generated TS module (web) + generated Swift enum (iOS), compiled from one JSON source. This is the
`@curio/contracts`/`@curio/tokens` pattern, generalised to the copy layer.

## Why this exists

WORK-BACKLOG.md Packet CC-1, from a cross-platform consistency audit
(`pokemon-tool`'s `CONSISTENCY-AUDIT-SUPPORT-REPORT.md`): route labels differed on 4/6 between web
and iOS ("List individually" vs "List on its own"), iOS displayed a raw status enum with no
case-conversion ("READY_TO_LIST" instead of "Ready to list" — breaking the sentence-case voice
rule), and web alone had a `£`-formatter hand-defined 17 times, six different "no cards here"
phrasings, and two error strings that violated the voice guide's own "no please" rule. None of
that is possible to prevent by convention alone — `canon/copy-voice.md` documents voice
*principles*, but until this package there was no single, pinnable source for the actual
*vocabulary*. This package is that source.

## What this produces

| Output | Consumer | Source |
|---|---|---|
| `dist/*.js` + `dist/*.d.ts` | pokemon-tool (web) | `src/*.ts` compiled directly by `tsc` |
| `Sources/CurioCopy/Strings.swift` | curio-capture-ios | generated FROM `src/strings.json` |
| `Sources/CurioCopy/Format.swift` | curio-capture-ios | hand-authored mirror of `src/format.ts`'s spec |

`Strings.swift` is generated (never hand-edit it). `Format.swift` is **not** generated — a
formatter is logic, not data, and there's no way to compile TS to Swift — so it's a deliberate,
hand-written mirror of the spec documented at the top of `src/format.ts`. Both implementations are
tested against the same fixture pairs (`src/fixtures.json` / `Tests/CurioCopyTests/FormatTests.swift`
literals) so if you change the spec and update only one side, a test fails in whichever repo hits
it first — see `src/format.ts`'s header comment before touching either file.

## Design choice: dictionaries, not per-key constants

Each group in `Strings.swift` is `public static let all: [String: String]` (e.g.
`CurioCopy.RouteLabels.all["list_single"]`), not one named constant per key. The real call site is
always "I have this raw wire string (a DB status, a route enum's raw value), give me its label" —
a dictionary answers that directly for every key, with no snake_case/kebab-case/UPPER_SNAKE_CASE
→ Swift-identifier conversion risk. See `scripts/gen-swift.mjs`'s header comment for the full
reasoning.

## Consuming this package

**Web (npm, git-URL dependency):**
```json
"dependencies": {
  "@curio/copy": "github:benjonesdesign/curio-copy#v0.1.0"
}
```
```ts
import { STRINGS, formatGBP, formatDate } from "@curio/copy";
STRINGS.recommendationRouteLabels.list_single;  // "List individually"
STRINGS.statusLabels.physicalCardLifecycle["READY_TO_LIST"];  // "Ready to list"
formatGBP(245);       // "£245.00"
formatDate("2026-08-09");  // "9 Aug"
```

**iOS (SwiftPM):** add this repo as a package dependency pinned to an exact version, then:
```swift
import CurioCopy
CurioCopy.RouteLabels.all["list_single"]              // "List individually"
CurioCopy.PhysicalCardLifecycleLabels.all[card.status] // e.g. "Ready to list"
CurioCopy.formatGBP(245)                               // "£245.00"
CurioCopy.formatDate("2026-08-09")                     // "9 Aug"
```

## Composing labels with platform-idiomatic decoration

Some source strings (`attentionQueueCtas`, `honestyCaveats`) are stored as plain content — no
trailing "→" arrow, no leading " — " dash — because that decoration is a *platform-idiomatic*
presentation choice, not shared content (canon/copy-voice.md's own consistent≠identical framing —
see `pokemon-tool`'s consistency-audit report, dimension 4). Web renders its own trailing chevron
via markup/CSS on `attentionQueueCtas` values; a caveat sentence composes as
`"\(base) — \(CurioCopy.HonestyCaveats.all["gradeEvNormalConfidence"]!)"` rather than baking the
em-dash into the shared string. Compose these however fits your platform's UI idiom; don't embed
UI decoration into the shared value.

## Releasing a new version

1. Edit `src/strings.json` (copy/vocabulary) or `src/format.ts` **and** `Sources/CurioCopy/Format.swift`
   together (formatting spec — see that file's header before touching either side).
2. `npm run build` — regenerates `Sources/CurioCopy/Strings.swift` from `src/strings.json`.
3. `npm run check` — fails if the committed `Strings.swift` is stale vs `src/strings.json`.
4. `npm run test` (TS) and `swift test` (Swift) — both must pass; if you changed the format spec,
   update `src/fixtures.json` AND `Tests/CurioCopyTests/FormatTests.swift`'s literals together.
5. Bump `version` in `package.json`, update `CHANGELOG.md`, commit, tag (`git tag vX.Y.Z`), push
   with tags — **unless the change touches a shape iOS also needs to review** (a new group, a
   renamed key, a format-spec change), in which case open a PR and **hold the tag** until the iOS
   side has reviewed it (mirrors `curio-contracts`' Packet-9 "coordinate before tagging" precedent).
6. Bump the pinned tag in `pokemon-tool`'s `package.json` and `curio-capture-ios`'s
   `project.yml`/Xcode package version.

## Governance

One owner for `src/strings.json` and the format spec. Changes land via PR here first, then a
version bump propagates to the two consumers — never edit `Sources/CurioCopy/Strings.swift` by
hand, and never re-implement a label, a formatter, or a piece of copy locally in a consumer repo
(that's exactly the drift this package exists to prevent).
