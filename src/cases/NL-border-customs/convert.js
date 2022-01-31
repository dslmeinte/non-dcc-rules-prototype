const fileName = "custom_business_rules _20211222 yellow & orange test"
const customRules = require(`./${fileName}.json`)
const ruleIds = [...(customRules.map((rule) => rule.Identifier))].sort()

const {and_} = require("certlogic-js/dist/factories")

const convertedRules = {
    id: fileName,
    description: "custom business rules for NL border control - yellow & orange test",
    rules: [
        {
            id: "end-result",
            versions: [
                {
                    validFrom: "2021-01-01",
                    logic: and_(
                        ...ruleIds.map((id) => ({ resultOf: [id] }))
                    )
                }
            ]
        },
        ...customRules
            .map((rule) => ({
                id: rule.Identifier,
                description: rule.Description.find((desc) => desc.lang === "en").desc,
                validTo: rule.ValidTo,
                versions: [     // only one version of each rule (~ Identifier)
                    {
                        validFrom: rule.ValidFrom,
                        logic: rule.Logic
                    }
                ]
            }))
    ]
}

const {writeFileSync} = require("fs")
writeFileSync("src/cases/NL-border-customs/rules.json", JSON.stringify(convertedRules, null, 2))

