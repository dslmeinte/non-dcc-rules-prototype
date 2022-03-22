import {CertLogicExpression} from "certlogic-js"
import {
    binOp_,
    if_,
    var_
} from "certlogic-js/dist/factories"

import {resultOf_, Rule} from "../../engine/types"


export type WhenCase = [ caseExpr: CertLogicExpression, resultExpr: CertLogicExpression ]
export const when_ = (cases: WhenCase[], default_: CertLogicExpression = true): CertLogicExpression => {
    if (cases.length === 0) {
        return default_
    }
    const [[caseExpr, resultExpr], ...rest] = cases
    return if_(caseExpr, resultExpr, when_(rest, default_))
}


export const or_ = (...operands: CertLogicExpression[]): CertLogicExpression => {
    switch (operands.length) {
        case 0: return true
        case 1: return operands[0]
        default: {
            const [head, rest] = operands
            return if_(head, true, or_(rest))
        }
    }
}

// TODO  move to certlogic-js-utils


export const exprForDccType = (dccType: string): WhenCase =>
    [
        var_(`payload.${dccType}.0`),
        if_(
            resultOf_(`${dccType}-DCC valid`),
            "entry granted without conditions",
            if_(
                resultOf_("age < 12y"),
                "entry granted without conditions",
                "conditions Red Zone"
            )
        )
    ]


export const rule = (id: string, logic: CertLogicExpression, description?: string): Rule =>
    ({
        id,
        versions: [
            {
                validFrom: "2021-07-13",
                logic
            }
        ],
        description
    })


export const asBoolean = (expr: CertLogicExpression): CertLogicExpression =>
    if_(expr, true, false)


export const isFromZone = (zone: string): CertLogicExpression =>
    binOp_("===", var_("non-DCC-data.origin of travel"), zone)


export type Category =
    | "entry granted without conditions"
    | "conditions Red Zone"
    | "conditions VOC"
    | "entry from Third Country - entry under conditions"
    | "entry from Third Country - quarantine"
    | "entry from Third Country - manual assessment"
export const isOfCategory = (category: Category): CertLogicExpression =>
    binOp_("===", resultOf_("category"), category)

