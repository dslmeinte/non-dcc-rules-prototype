import {and_, binOp_, if_, var_} from "certlogic-js/dist/factories"
import {Rule} from "dcc-business-rules-utils"

import {mapOperations} from "../../engine/tree-mapper"
import {resultOf_, Rules} from "../../engine/types"


const fileName = "custom_business_rules _20211222 yellow & orange test"
const customRules: Rule[] = require(`../../../src/cases/NL-border-customs/${fileName}.json`)
const ruleIds = [ ...(customRules.map((rule) => rule.Identifier)) ].sort()


const deNL = (ruleID: string) => {
    const parts = ruleID.split("-")
    return `${parts[0]}-${parts[2]}`
}


const countryCodePath = "external.countryCode"
const refDataSlotPath = "valueSets.EU-MemberStates"

const convertedRules: Rules = {
    id: "custom business rules for NL border control",
    rules: [
        {
            id: "CR-combined",
            versions: [
                {
                    validFrom: "2021-01-01",
                    logic: and_(
                        ...ruleIds.map((id) => resultOf_(deNL(id)))
                    )
                }
            ]
        },
        {
            id: "color",
            versions: [
                {
                    validFrom: "2021-01-01",
                    logic: if_(
                        binOp_(
                            "in",
                            var_(countryCodePath),
                            [ "US" ]
                        ),
                        "yellow",
                        "unknown"
                    )
                }
            ]
        },
        {
            id: "is_EU",
            versions: [
                {
                    validFrom: "2021-01-01",
                    logic: binOp_(
                        "in",
                        var_(countryCodePath),
                        var_(refDataSlotPath)
                    )
                }
            ]
        },
        ...customRules
            .map((rule) => ({
                id: deNL(rule.Identifier),
                validTo: rule.ValidTo,
                versions: [     // only one version of each rule (~ Identifier)
                    {
                        validFrom: rule.ValidFrom,
                        logic: mapOperations(
                            rule.Logic,
                            (operator, values) => operator === "var" && (values === "payload.from.color" || values === "payload.from.is_EU"),
                            (_, values) => resultOf_(values.substring(values.lastIndexOf(".") + 1))
                        )
                    }
                ],
                description: rule.Description.find((desc) => desc.lang === "en")!.desc,
            }))
    ],
    referenceDataSlots: [
        {
            path: refDataSlotPath,
            versions: [
                {
                    validFrom: "2021-01-01",
                    value: [ "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HU", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK" ]
                }
            ]
        }
    ]
}


export default convertedRules

