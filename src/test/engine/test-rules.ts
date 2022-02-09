import {CertLogicExpression} from "certlogic-js"

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
    ],
    referenceDataSlots: []
}


export default testRules

