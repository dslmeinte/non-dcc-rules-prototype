import {CertLogicExpression, evaluate} from "certlogic-js"

import {mapOperations, treeFlatMap} from "./tree-mapper"
import {isResultOf, Rule, Rules, RuleVersion} from "./types"
import {mapValues, reverse, sortBy, unique} from "../utils/functional"
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
            .map(([id, version]) => [id, version!.logic])
    )


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


export type RuleDependencies = { [ruleId: string]: string[] }
export type DependencyOrder = false | string[]
export const prepareEvaluation = (rules: Rules, now: Date):
        [
            applicableRuleLogic: RuleLogicMap,
            ruleDependencies: RuleDependencies,
            dependencyOrder: DependencyOrder
        ] => {
    const applicableRuleLogic_ = applicableRuleLogic(sortVersionsByValidFrom(rules), now)
    const ruleDependencies_ = mapValues(applicableRuleLogic_, dependenciesOf)
    const dependencyOrder = dependencyOrderOf(Object.keys(applicableRuleLogic_), (ruleId) => ruleDependencies_[ruleId])
    return [ applicableRuleLogic_, ruleDependencies_, dependencyOrder ]
}
// TODO  bundle this in a nicer structure

export const evaluateRules = (rules: Rules, data: any, now: Date): ResultsMap => {
    const [ applicableRuleLogic_, _, dependencyOrder ] = prepareEvaluation(rules, now)
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

