import {evaluate} from "certlogic-js"

import {Rule, Rules} from "./types"
import {dependenciesOf, replaceWithResults, ResultsMap} from "./resultOf-utils"
import {dependencyOrderOf} from "../utils/topological-sort"


export type RuleVersionEvaluation = {
    rule: Rule
    /**
     * The index of the applicable version of the `rule`.
     */
    indexOfApplicableVersion: number
    /**
     * The IDs of rules that the applicable rule version depends on (through "resultOf" operations).
     */
    dependencies: string[]
    /**
     * The result of the evaluation of the applicable rule version, after all its dependencies have been evaluated before.
     */
    result: any
}

/**
 * Either `false`, which corresponds to the dependency graph being cyclic,
 * or an array of {@link RuleVersionEvaluation} objects, in dependency order.
 */
export type Evaluation = false | RuleVersionEvaluation[]


const indexOfApplicableVersion = ({ validTo, versions }: Rule, now: Date): number =>
    (validTo !== undefined && new Date(validTo) < now)
        ? -1
        : versions.reduce((previous: number, current, index) =>
            previous === -1 || new Date(current.validFrom) <= now && new Date(versions[previous].validFrom) < new Date(current.validFrom)
                ? index : previous,
            -1
        )

export const evaluateRules = (rules: Rules, now: Date, data: any): Evaluation => {
    const step1 = rules.rules.map((rule) =>
        ({
            rule,
            indexOfApplicableVersion: indexOfApplicableVersion(rule, now)
        })
    )
    const step2 = step1
        .filter(({ indexOfApplicableVersion }) => indexOfApplicableVersion > -1)
    const step3 = step2
        .map((obj2) =>
            ({
                ...obj2,
                dependencies: dependenciesOf(obj2.rule.versions[obj2.indexOfApplicableVersion].logic),
                result: undefined
            })
        )
    const perId = Object.fromEntries(
        step3.map((obj3) =>
            [ obj3.rule.id, obj3 ]
        )
    )
    const step4 = dependencyOrderOf(step3, (obj3) => obj3.dependencies.map((ruleId) => perId[ruleId]))
    if (step4 === false) {
        return false
    }
    const resultsMap = step4
        .reduce((resultsMap: ResultsMap, obj4) =>
                ({
                    ...resultsMap,
                    [obj4.rule.id]: evaluate(replaceWithResults(obj4.rule.versions[obj4.indexOfApplicableVersion].logic, resultsMap), data)
                }),
            {}
        )
    // ...
    step4.forEach((obj4) => {
        obj4.result = resultsMap[obj4.rule.id]
    })
    return step4
}

