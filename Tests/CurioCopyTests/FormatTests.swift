// Same input/output pairs as src/fixtures.json (kept as literals here rather than a bundled
// resource, to keep the SwiftPM test target simple) — if you change fixtures.json, update this
// file's expectations to match in the same commit.

import XCTest
@testable import CurioCopy

final class FormatTests: XCTestCase {
    func testFormatGBP() {
        XCTAssertEqual(CurioCopy.formatGBP(245), "£245.00")
        XCTAssertEqual(CurioCopy.formatGBP(0), "£0.00")
        XCTAssertEqual(CurioCopy.formatGBP(1234.5), "£1,234.50")
        XCTAssertEqual(CurioCopy.formatGBP(9.999), "£10.00")
        XCTAssertEqual(CurioCopy.formatGBP(-12.34), "-£12.34")
        XCTAssertEqual(CurioCopy.formatGBP(1_000_000), "£1,000,000.00")
    }

    func testFormatGBPNonFinite() {
        XCTAssertEqual(CurioCopy.formatGBP(.nan), "£0.00")
        XCTAssertEqual(CurioCopy.formatGBP(.infinity), "£0.00")
    }

    func testFormatDate() {
        XCTAssertEqual(CurioCopy.formatDate("2026-08-09", style: .short), "9 Aug")
        XCTAssertEqual(CurioCopy.formatDate("2026-08-09", style: .full), "9 Aug 2026")
        XCTAssertEqual(CurioCopy.formatDate("2026-01-01", style: .short), "1 Jan")
        XCTAssertEqual(CurioCopy.formatDate("not-a-date", style: .short), "")
    }

    func testFormatDateDefaultsToShort() {
        XCTAssertEqual(CurioCopy.formatDate("2026-08-09"), "9 Aug")
    }
}
