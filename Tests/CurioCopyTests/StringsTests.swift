import XCTest
@testable import CurioCopy

final class StringsTests: XCTestCase {
    func testRouteLabelsCoverAllSixRoutes() {
        let keys = Set(CurioCopy.RouteLabels.all.keys)
        XCTAssertEqual(keys, ["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"])
    }

    func testConditionLabelsCoverAllValues() {
        let keys = Set(CurioCopy.ConditionLabels.all.keys)
        XCTAssertEqual(keys, ["NM", "LP", "MP", "HP", "DMG", "Graded"])
    }

    func testPhysicalCardLifecycleLookupByRawStatus() {
        // The real call site: a raw DB status string in, a display label out.
        XCTAssertEqual(CurioCopy.PhysicalCardLifecycleLabels.all["READY_TO_LIST"], "Ready to list")
        XCTAssertEqual(CurioCopy.PhysicalCardLifecycleLabels.all["NEEDS_ID_REVIEW"], "Needs ID review")
    }

    func testNoErrorCopyContainsPlease() {
        for (key, msg) in CurioCopy.ErrorCopy.all {
            XCTAssertFalse(msg.lowercased().contains("please"), "\(key) contains 'please'")
        }
    }
}
