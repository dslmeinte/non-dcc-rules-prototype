import React from "react"

import {CertLogicExpression} from "certlogic-js"
import {binOp_, if_, var_} from "certlogic-js/dist/factories"

import {UseCase} from "../types"


const varCoI = var_("countryOfInterest")
const colourLookup = (colour: string) => var_(`external.colourMap.${colour}`)
const colourIf = (colour: string, else_: CertLogicExpression): CertLogicExpression =>
    if_(
        binOp_("in", varCoI, colourLookup(colour)),
        colour,
        else_
    )
const colourAssessment = (...colours: string[]): CertLogicExpression =>
    colours.reverse()
        .reduce((acc: CertLogicExpression, colour) => colourIf(colour, acc), "undetermined")


const useCase: UseCase = {
    description: "time-dependent colour assessment",
    rules: {
        id: "colour assessment",
        rules: [
            {
                id: "risk-colour",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        logic: colourAssessment("green", "yellow", "orange", "red")
                    }
                ]
            }
        ],
        referenceDataSlots: [
            {
                path: "external.colourMap",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        validTo: "2022-03-01",
                        value: {
                            "green": ["DK"],
                            "yellow": ["CZ"],
                            "orange": ["NL"],
                            "red": ["BE"]
                        }
                    },
                    {
                        validFrom: "2022-03-01",
                        value: {
                            "green": ["BE", "DK", "CZ"],
                            "yellow": [],
                            "orange": ["NL"],
                            "red": []
                        }
                    }
                ]
            }
        ]
    },
    exampleDataOn: (_) => require("./example-data.json"),
    inputDataSchema: require("./data.schema.json"),
    explanation: <p>
        This use case shows how reference data can be versioned as well.
    </p>
}

export default useCase

