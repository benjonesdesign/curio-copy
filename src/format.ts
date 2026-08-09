// Canonical en-GB currency + date formatting spec (WORK-BACKLOG.md Packet CC-1 slice 1).
//
// pokemon-tool had this same £-formatter hand-defined 17 times (as a local `money()` helper) —
// this file is the one implementation. There is no way to share compiled JS with Swift, so the
// SPEC below is implemented twice — once here, once in Sources/CurioCopy/Format.swift — but both
// implementations are exact, deliberate mirrors of the same rules, and `fixtures.json` in this
// directory is the shared input/output truth table both platforms' test suites assert against.
// If you change a rule, update BOTH implementations and the fixtures in the same change.
//
// ── SPEC ──────────────────────────────────────────────────────────────────────────────────────
// formatGBP(amount):
//   - Locale: en-GB. Currency: GBP. Symbol: "£", prefixed (no space).
//   - Always exactly 2 decimal places.
//   - Thousands grouped with "," (e.g. 1,234.56).
//   - Negative amounts: "-£12.34" (minus sign before the £, not after).
// formatDate(isoDateString, style):
//   - style "short" (default): "9 Aug" — day (no leading zero) + space + short month name, en-GB.
//   - style "full": "9 Aug 2026" — adds the year.
//   - Invalid/unparseable input returns "" rather than throwing (a formatter must never crash a
//     render for bad data — surface the missing date some other way, not by throwing here).

export function formatGBP(amount: number): string {
  if (!Number.isFinite(amount)) return "£0.00";
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${negative ? "-" : ""}£${formatted}`;
}

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(isoDateString: string, style: "short" | "full" = "short"): string {
  const d = new Date(isoDateString);
  if (Number.isNaN(d.getTime())) return "";
  // UTC getters, deliberately — a plain "YYYY-MM-DD" input is a calendar date, not an instant, so
  // reading it back with LOCAL getters would shift the day depending on the runtime's timezone
  // (e.g. "2026-08-09" parses as UTC midnight; a UTC-8 runtime's local getDate() would read back
  // Aug 8). UTC getters make this deterministic regardless of where it runs.
  const day = d.getUTCDate();
  const month = SHORT_MONTHS[d.getUTCMonth()];
  return style === "full" ? `${day} ${month} ${d.getUTCFullYear()}` : `${day} ${month}`;
}
