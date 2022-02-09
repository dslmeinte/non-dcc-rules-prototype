import {CertLogicExpression} from "certlogic-js"

import {unique} from "../utils/functional"
import {Evaluation} from "./evaluator"
import {mapOperations, treeFlatMap} from "./tree-mapper"
import {isResultOf} from "./types"


export const dependenciesOf = (rootExpr: CertLogicExpression): string[] =>   // (exported for unit tests only)
    unique(
        treeFlatMap(
            rootExpr,
            (expr) =>
                isResultOf(expr) ? [ expr.resultOf[0] ] : []
        )
    ).sort()


export type ResultsMap = { [ruleId: string]: any }
export const replaceWithResults = (rootExpr: CertLogicExpression, resultsMap: ResultsMap): CertLogicExpression =>
    mapOperations(
        rootExpr,
        (_, operator) => operator === "resultOf",
        (_1, _2, values) => resultsMap[values[0]] as CertLogicExpression
    )


export const asResultsMap = (evaluation: Evaluation): ResultsMap =>
    evaluation === false
        ? {}
        : Object.fromEntries(
            evaluation.map(({ rule, result }) =>
                [ rule.id, result ]
            )
        )

