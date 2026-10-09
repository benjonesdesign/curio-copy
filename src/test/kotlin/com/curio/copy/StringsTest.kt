package com.curio.copy

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

// The generated Kotlin really does carry the strings, and carries the SAME keys the wire uses.
// Without this, "Android can consume @curio/copy" is a claim about a file existing — the same
// mistake as citing a test file as CI (decisions/0026's correction).
class StringsTest {
    @Test
    fun `route labels are keyed by the raw wire value, not a Kotlin identifier`() {
        // The design choice inherited from the Swift emitter: a map keyed by the raw string, so
        // `RouteLabels.all[decision.route.rawValue]` works with no identifier sanitisation.
        assertEquals("List individually", CurioCopy.RouteLabels.all["list_single"])
        assertEquals("Don't list", CurioCopy.RouteLabels.all["do_not_list"])
    }

    @Test
    fun `every decide reason code has English — the gap that kept iOS on api recommend`() {
        // @curio/contracts v0.1.29's decide module returns CODES and never English. If a code has
        // no label here, a client has no honest way to render it and falls back to inventing one,
        // which is what the contract forbids.
        for (code in listOf("below_bulk_floor", "net_below_minimum", "grade_worth_reviewing",
                            "thin_market", "bundle_lot_available", "sound_single_listing")) {
            assertTrue(CurioCopy.RouteReasonLabels.all.containsKey(code), "no label for route reason $code")
        }
        for (code in listOf("net_negative_after_costs", "bundle_shares_postage",
                            "list_ungraded_instead", "list_now_accept_slower", "list_alone_instead")) {
            assertTrue(CurioCopy.AlternativeReasonLabels.all.containsKey(code), "no label for alternative reason $code")
        }
        for (code in listOf("no_sale_count", "fees_unknown", "compatible_count_unknown")) {
            assertTrue(CurioCopy.DegradedReasonLabels.all.containsKey(code), "no label for degraded reason $code")
        }
        // The FOURTH shared enum. It was missed in v0.1.3, so iOS wrote these locally with the
        // deviation named -- the right interim and the wrong permanent state.
        for (code in listOf("identity_unresolved", "no_market_value", "pricing_unavailable")) {
            assertTrue(CurioCopy.DecisionUnavailableLabels.all.containsKey(code), "no label for $code")
        }
    }

    @Test
    fun `degraded labels say what was missing, not sorry`() {
        // A degraded decision is still the best available call. The seller is owed the reason, not
        // an apology or a hedge.
        val all = CurioCopy.DegradedReasonLabels.all.values
        for (v in all) {
            assertTrue(!v.lowercase().contains("sorry"), "degraded label apologises: $v")
            assertTrue(v.isNotBlank())
        }
    }

    @Test
    fun `an outage does not read like an ordinary result`() {
        // Two of the three are normal answers about a card; pricing_unavailable is an OUTAGE.
        // Showing the same tone for both tells the seller the wrong thing about which it is.
        val outage = CurioCopy.DecisionUnavailableLabels.all["pricing_unavailable"]!!
        val ordinary = CurioCopy.DecisionUnavailableLabels.all["no_market_value"]!!
        assertTrue(outage.contains("try again"), "an outage should invite a retry: $outage")
        assertTrue(!ordinary.contains("try again"), "a real answer should not invite a retry: $ordinary")
    }

    @Test
    fun `no label is empty anywhere`() {
        for (group in listOf(CurioCopy.RouteLabels.all, CurioCopy.RouteReasonLabels.all,
                             CurioCopy.AlternativeReasonLabels.all, CurioCopy.DegradedReasonLabels.all,
                             CurioCopy.DecisionUnavailableLabels.all,
                             CurioCopy.ConditionLabels.all, CurioCopy.ErrorCopy.all)) {
            for ((k, v) in group) assertTrue(v.isNotBlank(), "empty label for $k")
        }
    }

    // Design additions, 2026-10-09. Keys are curio-contracts v0.2.0's wire values, pinned as
    // literals so a rename on either side fails here rather than as a label never looked up.
    @Test
    fun `postage services are exactly the four contract codes`() {
        assertEquals(setOf("rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"),
                     CurioCopy.PostageServiceLabels.all.keys)
        assertEquals("Royal Mail 48 · large letter", CurioCopy.PostageServiceLabels.all["rm48_ll"])
    }

    @Test
    fun `most-to-pay reasons have a sentence and a line form`() {
        val codes = setOf("margin_not_set", "seller_type_not_set", "vat_not_set",
                          "asking_price_only", "no_price", "not_viable")
        assertEquals(codes, CurioCopy.MaxBuyUnavailableReasonLabels.all.keys)
        assertEquals(codes, CurioCopy.MaxBuyLineUnavailableLabels.all.keys)
        assertEquals("Nothing left", CurioCopy.MaxBuyLineUnavailableLabels.all["not_viable"])
    }

    @Test
    fun `listing refusal forms share their codes`() {
        assertEquals(CurioCopy.ListingRefusalReasonLabels.all.keys, CurioCopy.ListingRefusalShortLabels.all.keys)
    }

    @Test
    fun `status words for holding and identification`() {
        val l = CurioCopy.PhysicalCardLifecycleLabels.all
        assertEquals("Held", l["HELD"])
        assertEquals("Not identified", l["UNMATCHED"])
        assertEquals("Identifying", l["IDENTIFYING"])
        assertEquals("Returned", l["RETURNED"])
        assertEquals("Draft on eBay", l["EBAY_DRAFT"])
    }

    @Test
    fun `negative receive says the seller pays`() {
        assertEquals("You'd pay to sell this", CurioCopy.ReceiveLabels.all["negative"])
        assertEquals("Not set", CurioCopy.FeeNotSetValueLabel.all["value"])
    }
}
