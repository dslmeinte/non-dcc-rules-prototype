import React from "react"
import {CertLogicExpression} from "certlogic-js"
import {and_, binOp_, comparison_, if_, not_, var_} from "certlogic-js/dist/factories"

import {UseCase} from "../types"
import {resultOf_, Rule} from "../../engine/types"


const rule = (id: string, logic: CertLogicExpression, description?: string): Rule =>
    ({
        id,
        versions: [
            {
                validFrom: "2022-01-01",
                logic,
                ...(description === undefined ? {} : { description: description })
            }
        ]
    })

const useCase: UseCase = {
    description: "Button Module from 'Keep Talking and Nobody Explodes'",
    rules: {
        id: "button module disarming rules",
        description: "from 'Keep Talking and Nobody Explodes'",
        rules: [
            rule("press-rule-1", and_(
                    binOp_("===", var_("buttonColour"), "blue"),
                    binOp_("===", var_("buttonText"), "Abort"),
                    "press-and-hold"
                )
            ),
            rule("press-rule-2", if_(
                    resultOf_("press-rule-1"),
                    resultOf_("press-rule-1"),
                    and_(
                        not_(resultOf_("press-rule-1")),
                        comparison_(">", var_("numberOfBatteries"), 1),
                        binOp_("===", var_("buttonColour"), "Detonate"),
                        "press-and-immediately-release"
                    )
                )
            ),
            rule("press-rule-3", if_(
                    resultOf_("press-rule-2"),
                    resultOf_("press-rule-2"),
                    and_(
                        resultOf_("press-rule-2"),
                        binOp_("===", var_("buttonColour"), "white"),
                        binOp_("in", "CAR", var_("litIndicators")),
                        "press-and-hold"
                    )
                )
            ),
            rule("press-rule-4", if_(
                    resultOf_("press-rule-3"),
                    resultOf_("press-rule-3"),
                    and_(
                        comparison_(">", var_("numberOfBatteries"), 2),
                        binOp_("in", "FRK", var_("litIndicators")),
                        "press-and-immediately-release"
                    )
                )
            ),
            rule("press-rule-5", if_(
                    resultOf_("press-rule-4"),
                    resultOf_("press-rule-4"),
                    and_(
                        resultOf_("press-rule-4"),
                        binOp_("===", var_("buttonColour"), "yellow"),
                        "press-and-hold"
                    )
                )
            ),
            rule("press-rule-6", if_(
                    resultOf_("press-rule-5"),
                    resultOf_("press-rule-5"),
                    and_(
                        binOp_("===", var_("buttonColour"), "red"),
                        binOp_("===", var_("buttonText"), "Hold"),
                        "press-and-immediately-release"
                    )
                )
            ),
            rule("press-rule-7", if_(
                    resultOf_("press-rule-6"),
                    resultOf_("press-rule-6"),
                    "press-and-hold"
                )
            ),
            rule("press-action", resultOf_("press-rule-7"), "(This rule merely repeats the result of the press rules.)"),
            rule("release-action", if_(
                    binOp_("===", resultOf_("press-action"), "press-and-immediately-release"),
                    "press-and-immediately-release",
                    if_(
                        binOp_("===", var_("stripColour"), "???"),
                        "observe-strip-colour",
                        if_(
                            binOp_("===", var_("stripColour"), "blue"),
                            4,
                            if_(
                                binOp_("===", var_("stripColour"), "white"),
                                1,
                                if_(
                                    binOp_("===", var_("stripColour"), "yellow"),
                                    5,
                                    1
                                )
                            )
                        )
                    )
                )
            )
        ],
        referenceDataSlots: []
    },
    exampleDataOn: (_) => ({
        buttonColour: "blue",
        buttonText: "Abort",
        numberOfBatteries: 4,
        litIndicators: [],
        stripColour: "???"
    }),
    inputDataSchema: require("./data.schema.json"),
    explanation: <p>
        These rules describe how to disarm a button module in the 'Keep Talking and Nobody Explodes' co-op game.
    </p>
}

export default useCase

