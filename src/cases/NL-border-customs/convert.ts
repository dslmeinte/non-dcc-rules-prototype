import {CertLogicExpression} from "certlogic-js"
import {and_, binOp_, if_, var_} from "certlogic-js/dist/factories"
import {Rule} from "dcc-business-rules-utils"
import {writeFileSync} from "fs"

import {mapOperations} from "../../engine/tree-mapper"


const fileName = "custom_business_rules _20211222 yellow & orange test"
const customRules: Rule[] = require(`../../../src/cases/NL-border-customs/${fileName}.json`)
const ruleIds = [ ...(customRules.map((rule) => rule.Identifier)) ].sort()


const deNL = (ruleID: string) => {
    const parts = ruleID.split("-")
    return `${parts[0]}-${parts[2]}`
}


const convertedRules = {
    id: fileName,
    description: "custom business rules for NL border control - yellow & orange test",
    rules: [
        {
            id: "CR-combined",
            versions: [
                {
                    validFrom: "2021-01-01",
                    logic: and_(
                        ...ruleIds.map((id) => ({ resultOf: [deNL(id)] }) as any as CertLogicExpression)
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
                            var_("external.countryCode"),
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
                        var_("external.countryCode"),
                        [ "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HU", "HR", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK" ]
                    )
                }
            ]
        },
        ...customRules
            .map((rule) => ({
                id: deNL(rule.Identifier),
                description: rule.Description.find((desc) => desc.lang === "en")!.desc,
                validTo: rule.ValidTo,
                versions: [     // only one version of each rule (~ Identifier)
                    {
                        validFrom: rule.ValidFrom,
                        logic: mapOperations(
                            rule.Logic,
                            (_, operator, values) => operator === "var" && (values === "payload.from.color" || values === "payload.from.is_EU"),
                            (_1, _2, values) => ({ "resultOf": [ values.substring(values.lastIndexOf(".") + 1) ] }) as any as CertLogicExpression
                        )

                    }
                ]
            }))
    ]
}


writeFileSync("src/cases/NL-border-customs/rules.json", JSON.stringify(convertedRules, null, 2))

