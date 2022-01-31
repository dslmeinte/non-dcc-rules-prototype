import {
    CertLogicExpression,
    CertLogicOperation,
    evaluate
} from "certlogic-js"
import {isInt} from "certlogic-js/dist/internals"

import {operationDataFrom, treeFlatMap} from "./tree-walker"
import {isResultOf, Rule, Rules, RuleVersion} from "./types"
import {mapValues, reverse, sortBy} from "../utils/functional"
import {dependencyOrderOf} from "../utils/topological-sort"


export const sortVersionsByValidFrom = ({ id, description, rules }: Rules): Rules =>    // (exported for unit tests only)
    ({
        id,
        description,
        rules: rules.map(({ id, description, validTo, versions }: Rule) =>
            ({
                id,
                description,
                validTo,
                versions: reverse(  // descending order: most recent to oldest
                    sortBy(versions, (ruleVersion) => new Date(ruleVersion.validFrom).getTime())
                )
            }))
    })


type RuleLogicMap = { [ruleId: string]: CertLogicExpression }
export const applicableRuleLogic = (sortedRules: Rules, now: Date): RuleLogicMap =>   // (exported for unit tests only)
    Object.fromEntries(
        sortedRules.rules
            .map((rule) => [
                rule.id,
                rule.versions.find((ruleVersion) => new Date(ruleVersion.validFrom) < now)
            ] as [ string, RuleVersion | undefined ])
            .filter(([_, version]) => version !== undefined)
            .map(([id, version]) => [id, version!!.logic])
    )


export const dependenciesOf = (rootExpr: CertLogicExpression): string[] =>   // (exported for unit tests only)
    treeFlatMap(
        rootExpr,
        (expr) =>
            isResultOf(expr) ? [ expr.resultOf[0] ] : []
    )


type ResultsMap = { [ruleId: string]: any }
export const replaceWithResults = (rootExpr: CertLogicExpression, resultsMap: ResultsMap): CertLogicExpression => {   // (exported for unit tests only)
    const replace_ = (expr: CertLogicExpression): CertLogicExpression => {
        if (typeof expr === "string" || isInt(expr) || typeof expr === "boolean") {
            return expr
        }
        if (Array.isArray(expr)) {
            return (expr as CertLogicExpression[]).map(replace_)
        }
        if (typeof expr === "object") {
            const { operator, values } = operationDataFrom(expr)
            if (operator === "resultOf") {
                return resultsMap[values[0]] as CertLogicExpression
            }
            if (operator === "var") {
                return expr
            }
            return {
                [operator]: (values as CertLogicExpression[]).map(replace_)
            } as CertLogicOperation
        }
        throw new Error(`invalid CertLogic expression: ${expr}`)    // (never reached)
    }
    return replace_(rootExpr)
}


export const evaluateRules = (rules: Rules, data: any, now: Date): ResultsMap => {
    const applicableRuleLogic_ = applicableRuleLogic(sortVersionsByValidFrom(rules), now)
    const ruleDependencies_ = mapValues(applicableRuleLogic_, dependenciesOf)
    const dependencyOrder = dependencyOrderOf(Object.keys(applicableRuleLogic_), (ruleId) => ruleDependencies_[ruleId])
    if (dependencyOrder === false) {
        throw new Error(`rules versions to evaluate exhibit a cycle in their dependency on one another`)
    }
    return dependencyOrder
        .reduce((resultsMap: ResultsMap, ruleId) =>
                ({
                    ...resultsMap,
                    [ruleId]: evaluate(replaceWithResults(applicableRuleLogic_[ruleId], resultsMap), data)
                }),
            {}
        )
}

