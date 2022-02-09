const {deepEqual, equal} = require("chai").assert

import {applicableRuleLogic, evaluateRules, sortVersionsByValidFrom} from "../../engine/evaluator"
import testRules from "./test-rules"


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

})


describe("evaluateRules", () => {

    it("works on test rules", () => {
        deepEqual(
            evaluateRules(testRules, new Date("2022-01-01"), { q: "bar" }),
            {
                rule0: true,
                rule1: "bar"
            }
        )
        deepEqual(
            evaluateRules(testRules, new Date("2022-03-01"), { q: "bar" }),
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
        const result = evaluateRules(rules, now, data)
        equal(result["CR-combined"], false)
    })

})

