import {
    and_,
    binOp_,
    comparison_,
    if_, not_,
    plusTime_,
    var_
} from "certlogic-js/dist/factories"

import {resultOf_, Rules} from "../../engine/types"
import {
    asBoolean,
    isFromZone,
    rule,
    exprForDccType,
    when_,
    isOfCategory, or_
} from "./factories"


const rules: Rules = {
    id: "BE rules",
    rules: [
        rule(
            "age < 12y",
            comparison_(
                "after",
                plusTime_(var_("payload.dob"), 12, "year"),
                plusTime_(var_("external.validationClock"), 0, "day")
            )
        ),
        rule(
            "v-DCC valid",
            if_(
                var_("payload.v.0"),
                and_(
                    binOp_("in", var_("payload.v.0.mp"), var_("refData.approved-vaccines")),    // EMA-approved + Covishield
                    comparison_(">=", var_("payload.v.0.dn"), var_("payload.v.0.sd")),          // fully vaccinated
                    comparison_(
                        "before",
                        plusTime_(var_("payload.v.0.dt"), 14, "day"),
                        plusTime_(var_("external.validationClock"), 0, "day")
                    )                                                                                                                // at least 14 days ago
                ),
                false
            )
        ),
        rule(
            "t-DCC valid",
            if_(
                var_("payload.t.0"),
                and_(
                    binOp_("===", var_("payload.t.0.tr"), "260415000"),                             // test result is negative
                    binOp_("===", var_("payload.t.0.tt"), "LP6464-4"),                              // test is of type PCR/NAAT
                    comparison_(
                        "not-before",
                        plusTime_(var_("payload.t.0.sc"), 72, "hour"),
                        plusTime_(var_("external.validationClock"), 0, "hour")
                    )                                                                                                               // at most 72h old
                ),
                false
            ),
            "DCC is valid PCR-test at most 72h old"
        ),
        rule(
            "r-DCC valid",
            if_(
                var_("payload.r.0"),
                comparison_(    // TODO  could add df <= now <= du
                    "not-after",
                    plusTime_(var_("payload.r.0.fr"), 11, "day"),
                    plusTime_(var_("external.validationClock"), 0, "day"),
                    plusTime_(var_("payload.r.0.fr"), 180, "day")
                ),                                                                                                                  // now between first positive test + [11d, 180d]
                false
            )
        ),
        rule(
            "category",
            when_([
                [
                    var_("non-DCC-data.citizen of Third Country"),
                    /* -> */ "entry from Third Country - manual assessment"
                ],
                [
                    binOp_("in", var_("non-DCC-data.origin of travel"), ["Green Zone", "Orange Zone"]),
                    /* -> */ "entry granted without conditions"
                ],
                [
                    isFromZone("Red Zone"),
                    /* -> */ when_(["v", "t", "r"].map(exprForDccType), false)
                ],
                [
                    isFromZone("VOC Zone"),
                    /* -> */ "conditions VOC"
                ],
                [
                    isFromZone("Third Country"),
                    /* -> */ if_(
                        resultOf_("v-DCC valid"),
                        "entry from Third Country - entry under conditions",
                        "entry from Third Country - quarantine"
                    )
                ]
            ], false),  // false <=> was not able to determine answer
            "Determines the first-phase result (the second decision table block) based on origin and certificates presented."
        ),
        rule(
            "entry permitted",
            when_([
                [
                    isOfCategory("entry granted without conditions"),
                    /* -> */ true
                ],
                [
                    isOfCategory("conditions Red Zone"),
                    /* -> */ or_(
                        resultOf_("t-DCC valid"),
                        resultOf_("age < 12y"),
                        false
                    )
                ],
                [
                    isOfCategory("conditions VOC"),
                    /* -> */ or_(
                        var_("non-DCC-data.Belgian resident"),
                        var_("non.DCC-data.travel is essential")
                    )
                ],
                [
                    isOfCategory("entry from Third Country - entry under conditions"),
                    /* -> */ true
                ],
                [
                    isOfCategory("entry from Third Country - quarantine"),
                    /* -> */ true
                ],
                [
                    isOfCategory("entry from Third Country - manual assessment"),
                    /* -> */ asBoolean(var_("non-DCC-data.travel is essential"))
                ]
            ], false)
        ),
        rule(
            "quarantine",
            when_([
                [
                    isOfCategory("entry granted without conditions"),
                    /* -> */ false
                ],
                [
                    isOfCategory("conditions Red Zone"),
                    /* -> */ not_(or_(
                        resultOf_("t-DCC valid"),
                        resultOf_("age < 12y")
                    ))
                ],
                [
                    isOfCategory("conditions VOC"),
                    /* -> */ not_(
                        var_("non-DCC-data.travel is essential"),
                    )
                ],
                [
                    isOfCategory("entry from Third Country - entry under conditions"),
                    /* -> */ true
                ],
                [
                    isOfCategory("entry from Third Country - quarantine"),
                    /* -> */ true
                ],
                [
                    isOfCategory("entry from Third Country - manual assessment"),
                    /* -> */ true
                ]
            ], true)
        )
    ],
    referenceDataSlots: [
        {
            path: "refData.approved-vaccines",
            versions: [
                {
                    validFrom: "2021-07-13",
                    value: [
                        "EU/1/20/1507",
                        "EU/1/20/1525",
                        "EU/1/20/1528",
                        "EU/1/21/1529",
                        "EU/1/21/1618",
                        "Covishield"
                    ]
                }
            ]
        }
    ]
}

export default rules

