const {deepEqual} = require("chai").assert

import {dependenciesOf, replaceWithResults} from "../../engine/resultOf-utils"
import testRules from "./test-rules"


describe("helper functions", () => {

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

