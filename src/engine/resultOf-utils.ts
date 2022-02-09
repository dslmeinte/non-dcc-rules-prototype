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
        ( operator, _) => operator === "resultOf",
        (_, values) => resultsMap[values[0]] as CertLogicExpression
    )


export const asResultsMap = (evaluation: Evaluation): ResultsMap =>
    evaluation === false
        ? {}
        : Object.fromEntries(
            evaluation.map(({ rule, result }) =>
                [ rule.id, result ]
            )
        )


export const renderAsCompactText = (expr: CertLogicExpression): string => {
    if (Array.isArray(expr)) {
        return `[ ${(expr as CertLogicExpression[]).map(renderAsCompactText).join(", ")} ]`
    }
    if (typeof expr === "object" && Object.entries(expr).length === 1) {
        const [ operator, values ] = Object.entries(expr)[0]
        if (operator === "var") {
            return `/${values}`
        }
        const operands = values as CertLogicExpression[]
        switch (operator) {
            case "if": return `if (${renderAsCompactText(operands[0])}) then (${renderAsCompactText(operands[1])}) else (${renderAsCompactText(operands[2])})`
            case "===":
            case "and":
            case ">":
            case "<":
            case ">=":
            case "<=":
            case "in":
            case "+":
            case "after":
            case "before":
            case "not-after":
            case "not-before":
                return (operands as CertLogicExpression[]).map(renderAsCompactText).map((r) => `(${r})`).join(` ${operator} `)
            case "!": return `not (${renderAsCompactText(operands[0])})`
            case "plusTime": return `(${renderAsCompactText(operands[0])}) ${operands[1] >= 0 ? "+" : ""}${operands[1]} ${operands[2]}${Math.abs(operands[1] as number) === 1 ? "" : "s"}`
            case "reduce": return `(${renderAsCompactText(operands[0])}).reduce((current, accumulator) → ${renderAsCompactText(operands[1])}, ${renderAsCompactText(operands[2])})`
            case "extractFromUVCI": return `extract fragment ${operands[1]} from UVCI (${renderAsCompactText(operands[0])})`
            case "resultOf": return `@("${operands[0]}")`
        }
    }
    // fall-back:
    return JSON.stringify(expr)
}

