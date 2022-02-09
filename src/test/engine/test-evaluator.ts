const {deepEqual, equal, isNotFalse} = require("chai").assert

import {evaluateRules} from "../../engine/evaluator"
import {asResultsMap} from "../../engine/resultOf-utils"
import testRules from "./test-rules"


describe("evaluateRules", () => {

    it("works on test rules", () => {
        const result1 = evaluateRules(testRules, new Date("2022-01-01"), { q: "bar" })
        isNotFalse(result1)
        deepEqual(
            asResultsMap(result1),
            {
                rule0: true,
                rule1: "bar"
            }
        )
        const result2 = evaluateRules(testRules, new Date("2022-03-01"), { q: "bar" })
        isNotFalse(result2)
        deepEqual(
            asResultsMap(result2),
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
        const result = asResultsMap(evaluateRules(rules, now, data))
        equal(result["CR-combined"], false)
    })

})

