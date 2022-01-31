const {deepEqual, equal} = require("chai").assert

import {CertLogicExpression} from "certlogic-js"

import {
    applicableRuleLogic,
    dependenciesOf, evaluateRules,
    replaceWithResults,
    sortVersionsByValidFrom
} from "../../engine/evaluator"
import {Rules} from "../../engine/types"


const testRules: Rules = {
    id: "rules",
    rules: [
        {
            id: "rule0",
            versions: [
                {
                    validFrom: "2021-01-01",
                    logic: true
                },
                {
                    validFrom: "2022-02-01",
                    logic: false
                }
            ]
        },
        {
            id: "rule1",
            versions: [
                {
                    validFrom: "2021-01-01",
                    logic: {
                        if: [
                            {
                                resultOf: [
                                    "rule0"
                                ]
                            } as any as CertLogicExpression,    // need to force compiler's hand
                            { var: "q" },
                            false
                        ]
                    }
                }
            ]
        }
    ]
}


describe("helper functions", () => {

    it("sortVersionsByValidFrom works", () => {
        const sorted = sortVersionsByValidFrom(testRules)
        equal(sorted.rules[0].versions[0].validFrom, "2022-02-01")
    })

    it("applicableRuleVersions", () => {
        const sorted = sortVersionsByValidFrom(testRules)
        const rulesLogicMap = applicableRuleLogic(sorted, new Date("2022-01-01"))
        equal(rulesLogicMap["rule0"], true)
    })

    it("dependenciesOf", () => {
        deepEqual(
            dependenciesOf(testRules.rules[1].versions[0].logic),
            [ "rule0" ]
        )
    })

    it("replaceWithResults", () => {
        deepEqual(
            replaceWithResults(testRules.rules[1].versions[0].logic, { "rule0": "foo" }),
            {
                if: [
                    "foo",
                    { var: "q" },
                    false
                ]
            }
        )
    })

})


describe("evaluateRules", () => {

    it("works on test rules", () => {
        deepEqual(
            evaluateRules(testRules, { q: "bar" }, new Date("2022-01-01")),
            {
                rule0: true,
                rule1: "bar"
            }
        )
        deepEqual(
            evaluateRules(testRules, { q: "bar" }, new Date("2022-03-01")),
            {
                rule0: false,
                rule1: false
            }
        )
    })

    it("works on NL custom border rules", () => {
        const rules = require("../../../src/cases/NL-border-customs/rules.json")
        const now = new Date()
        const data = require("../../../src/cases/NL-border-customs/example-data.json")
        data.external.validationClock = now.toISOString()
        const result = evaluateRules(rules, data, now)
        equal(result["end-result"], false)
    })

})

