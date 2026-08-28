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
    fun `no label is empty anywhere`() {
        for (group in listOf(CurioCopy.RouteLabels.all, CurioCopy.RouteReasonLabels.all,
                             CurioCopy.AlternativeReasonLabels.all, CurioCopy.DegradedReasonLabels.all,
                             CurioCopy.ConditionLabels.all, CurioCopy.ErrorCopy.all)) {
            for ((k, v) in group) assertTrue(v.isNotBlank(), "empty label for $k")
        }
    }
}
