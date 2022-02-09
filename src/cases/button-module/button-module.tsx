import React from "react"
import {
    and_,
    binOp_,
    comparison_, if_, not_,
    var_
} from "certlogic-js/dist/factories"

import {UseCase} from "../types"
import {resultOf_} from "../../engine/types"


const useCase: UseCase = {
    description: "Button Module from 'Keep Talking and Nobody Explodes'",
    rules: {
        id: "button module disarming rules",
        description: "from 'Keep Talking and Nobody Explodes'",
        rules: [
            {
                id: "press-rule-1",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        logic: and_(
                            binOp_("===", var_("buttonColour"), "blue"),
                            binOp_("===", var_("buttonText"), "Abort"),
                            "hold"
                        ),
                    }
                ]
            },
            {
                id: "press-rule-2",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        logic: if_(
                            resultOf_("press-rule-1"),
                            resultOf_("press-rule-1"),
                            and_(
                                not_(resultOf_("press-rule-1")),
                                comparison_(">", var_("numberOfBatteries"), 1),
                                binOp_("===", var_("buttonColour"), "Detonate"),
                                "press-and-immediately-release"
                            )
                        )
                    }
                ]
            },
            {
                id: "press-rule-3",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        logic: if_(
                            resultOf_("press-rule-2"),
                            resultOf_("press-rule-2"),
                            and_(
                                resultOf_("press-rule-2"),
                                binOp_("===", var_("buttonColour"), "white"),
                                binOp_("in", "CAR", var_("litIndicators")),
                                "hold"
                            )
                        )
                    }
                ]
            },
            {
                id: "press-rule-4",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        logic: if_(
                            resultOf_("press-rule-3"),
                            resultOf_("press-rule-3"),
                            and_(
                                comparison_(">", var_("numberOfBatteries"), 2),
                                binOp_("in", "FRK", var_("litIndicators")),
                                "press-and-immediately-release"
                            )
                        )
                    }
                ]
            },
            {
                id: "press-rule-5",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        logic: if_(
                            resultOf_("press-rule-4"),
                            resultOf_("press-rule-4"),
                            and_(
                                resultOf_("press-rule-4"),
                                binOp_("===", var_("buttonColour"), "yellow"),
                                "hold"
                            )
                        )
                    }
                ]
            },
            {
                id: "press-rule-6",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        logic: if_(
                            resultOf_("press-rule-5"),
                            resultOf_("press-rule-5"),
                            and_(
                                binOp_("===", var_("buttonColour"), "red"),
                                binOp_("===", var_("buttonText"), "Hold"),
                                "press-and-immediately-release"
                            )
                        )
                    }
                ]
            },
            {
                id: "press-rule-7",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        logic: if_(
                            resultOf_("press-rule-6"),
                            resultOf_("press-rule-6"),
                            "hold"
                        )
                    }
                ]
            },
            {
                id: "action",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        logic: if_(
                            binOp_("===", resultOf_("press-rule-7"), "press-and-immediately-release"),
                            "press-and-immediately-release",
                            if_(
                                binOp_("===", var_("stripColour"), "blue"),
                                "release-with-4",
                                if_(
                                    binOp_("===", var_("stripColour"), "white"),
                                    "release-with-1",
                                    if_(
                                        binOp_("===", var_("stripColour"), "yellow"),
                                        "release-with-5",
                                        "release-with-1"
                                    )
                                )
                            )
                        )
                    }
                ]
            }
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

