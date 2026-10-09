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

    // Design additions, 2026-10-09. Keys are curio-contracts v0.2.0's wire values, pinned as
    // literals so a rename on either side fails here rather than as a label never looked up.
    func testPostageServicesAreExactlyTheFourContractCodes() {
        XCTAssertEqual(Set(CurioCopy.PostageServiceLabels.all.keys),
                       ["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"])
        XCTAssertEqual(CurioCopy.PostageServiceLabels.all["rm48_ll"], "Royal Mail 48 · large letter")
    }

    func testMostToPayReasonsHaveASentenceAndALineForm() {
        let codes: Set<String> = ["margin_not_set", "seller_type_not_set", "vat_not_set",
                                  "asking_price_only", "no_price", "not_viable"]
        XCTAssertEqual(Set(CurioCopy.MaxBuyUnavailableReasonLabels.all.keys), codes)
        XCTAssertEqual(Set(CurioCopy.MaxBuyLineUnavailableLabels.all.keys), codes)
        XCTAssertEqual(CurioCopy.MaxBuyLineUnavailableLabels.all["not_viable"], "Nothing left")
    }

    func testListingRefusalFormsShareTheirCodes() {
        XCTAssertEqual(Set(CurioCopy.ListingRefusalReasonLabels.all.keys),
                       Set(CurioCopy.ListingRefusalShortLabels.all.keys))
    }

    func testStatusWordsForHoldingAndIdentification() {
        XCTAssertEqual(CurioCopy.PhysicalCardLifecycleLabels.all["HELD"], "Held")
        XCTAssertEqual(CurioCopy.PhysicalCardLifecycleLabels.all["UNMATCHED"], "Not identified")
        XCTAssertEqual(CurioCopy.PhysicalCardLifecycleLabels.all["IDENTIFYING"], "Identifying")
        XCTAssertEqual(CurioCopy.PhysicalCardLifecycleLabels.all["RETURNED"], "Returned")
        XCTAssertEqual(CurioCopy.PhysicalCardLifecycleLabels.all["EBAY_DRAFT"], "Draft on eBay")
    }

    func testNegativeReceiveSaysTheSellerPays() {
        XCTAssertEqual(CurioCopy.ReceiveLabels.all["negative"], "You'd pay to sell this")
        XCTAssertEqual(CurioCopy.FeeNotSetValueLabel.all["value"], "Not set")
    }
}
