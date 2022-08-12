import React from "react"
import {and_, binOp_, if_, var_} from "certlogic-js/dist/factories"

import {UseCase} from "../types"
import {or_} from "../BE-rules/factories"
import {resultOf_} from "../../engine/types"


const eeaCountryCodes = [ "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HU", "HR", "IE", "IT", "IS", "LI", "LT", "LU", "LV", "MT", "NL", "NO", "PL", "PT", "RO", "SE", "SI", "SK" ]
const CoD = () => var_("external.CoDcode")
const dccTypeRequested = () => resultOf_("DCC type requested")


const useCase: UseCase = {
    description: "Spain use case",
    rules: {
        id: "ES - DCC type requested",
        rules: [
            {
                id: "DCC type requested",
                description: "the type of DCC request ('none' string means 'none requested', etc.)",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        logic: if_(
                            binOp_("in", CoD(), var_("external.eeaCountries")),
                            "none",
                            if_(
                                or_(
                                    binOp_("===", CoD(), "CO"),
                                    binOp_("===", CoD(), "EC")
                                ),
                                "vaccination",
                                "any"
                            )
                        )
                    }
                ]
            },
            {
                id: "DCC type OK",
                description: "check the type of DCC presented",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        logic: if_(
                            binOp_("in", dccTypeRequested(), [ "none", "any" ]),
                            true,
                            if_(
                                binOp_("===", dccTypeRequested(), "vaccination"),
                                if_(var_("payload.v.0"), true, false),
                                false
                            )
                        )
                    }
                ]
            }
        ],
        referenceDataSlots: [
            {
                path: "external.eeaCountries",
                versions: [
                    {
                        validFrom: "2022-01-01",
                        value: eeaCountryCodes
                    }
                ]
            }
        ]
    },
    exampleDataOn: (now) => {
        const exampleData = require("./example-data.json")
        exampleData.external.validationClock = now.toISOString()
        return exampleData
    },
    inputDataSchema: require("./data.schema.json"),
    explanation: <>
        <p>
        This use case shows how the “Spain use case”, expressed through the following pseudo-code could be implemented using this technology.
        </p>
        <img src={"img/ES-pseudo-code.png"} height={150} />
    </>
}

export default useCase

