import React from "react"

import {UseCase} from "../types"

import rules from "./rules"


const useCase: UseCase = {
    description: "(BE) non-DCC entry rules",
    rules,
    exampleDataOn: (now) => {
        const exampleData = require("./example-data.json")
        exampleData.external.validationClock = now.toISOString()
        return exampleData
    },
    inputDataSchema: require("./data.schema.json"),
    explanation: <p>
        These rules are an attempt to capture the Belgian regulations w.r.t. entering Belgium in the context of COVID-19.
    </p>
}

export default useCase

