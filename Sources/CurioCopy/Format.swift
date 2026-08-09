// Hand-authored (not generated) — the Swift mirror of src/format.ts's canonical spec. See that
// file's header comment for the full spec; this file must implement it identically. Both
// implementations are tested against the SAME fixtures (src/fixtures.json / Tests/CurioCopyTests/
// FormatTests.swift) so a divergence shows up as a failing test in whichever repo hits it first.

import Foundation

extension CurioCopy {
    /// "£245.00" / "-£12.34" / "£1,234.56" — en-GB, always 2dp, "," thousands separator, "£"
    /// prefixed with no space, minus sign before the £ on negative amounts.
    public static func formatGBP(_ amount: Double) -> String {
        guard amount.isFinite else { return "£0.00" }
        let negative = amount < 0
        let abs = Swift.abs(amount)
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.locale = Locale(identifier: "en_GB")
        formatter.minimumFractionDigits = 2
        formatter.maximumFractionDigits = 2
        formatter.groupingSeparator = ","
        formatter.decimalSeparator = "."
        let formatted = formatter.string(from: NSNumber(value: abs)) ?? String(format: "%.2f", abs)
        return "\(negative ? "-" : "")£\(formatted)"
    }

    private static let shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    /// "9 Aug" (style .short, default) or "9 Aug 2026" (style .full). Empty string on unparseable
    /// input — a formatter must never crash a render for bad data.
    public enum DateStyle { case short, full }

    public static func formatDate(_ isoDateString: String, style: DateStyle = .short) -> String {
        // UTC, deliberately — a plain "YYYY-MM-DD" input is a calendar date, not an instant; local
        // getters would shift the day depending on the runtime's timezone. Matches format.ts.
        var utcCalendar = Calendar(identifier: .gregorian)
        utcCalendar.timeZone = TimeZone(identifier: "UTC")!
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withFullDate]
        guard let date = isoFormatter.date(from: isoDateString) ?? fallbackParse(isoDateString) else { return "" }
        let comps = utcCalendar.dateComponents([.day, .month, .year], from: date)
        guard let day = comps.day, let month = comps.month, let year = comps.year else { return "" }
        let monthName = shortMonths[month - 1]
        return style == .full ? "\(day) \(monthName) \(year)" : "\(day) \(monthName)"
    }

    /// ISO8601DateFormatter with .withFullDate only accepts exactly "YYYY-MM-DD"; fall back to a
    /// plain DateFormatter for inputs with a time component, same tolerance `new Date(...)` has in
    /// the TS implementation.
    private static func fallbackParse(_ s: String) -> Date? {
        let df = DateFormatter()
        df.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
        df.timeZone = TimeZone(identifier: "UTC")
        if let d = df.date(from: s) { return d }
        df.dateFormat = "yyyy-MM-dd"
        df.timeZone = TimeZone(identifier: "UTC")
        return df.date(from: s)
    }
}
