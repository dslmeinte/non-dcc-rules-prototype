import React from "react"

import {UseCase} from "../types"

import rules from "./rules-migrator"


const useCase: UseCase = {
    description: "(NL) custom border rules",
    rules,
    exampleDataOn: (now) => {
        const exampleData = require("./example-data.json")
        exampleData.external.validationClock = now.toISOString()
        return exampleData
    },
    inputDataSchema: require("./data.schema.json"),
    explanation: <p>
        The rules with IDs <span className="ID">color</span>, and <span className="ID">is_EU</span> inspect the value of the field <span className="ID">external.countryCode</span>, which is the code for the country of departure.
        The results of these two rules are then used by the rules <span className="ID">CR-0001</span>&hellip;<span className="ID">CR-0010</span> which each produce <span className="ID">true/false</span>.
        (There is no rule <span className="ID">CR-0008</span>.)
        Finally, the rule <span className="ID">CR-combined</span> combines the results of the rules <span className="ID">CR-0001</span>&hellip;<span className="ID">CR-0010</span> by computing whether these all produced a <span className="ID">true</span> value.
    </p>
}

export default useCase

