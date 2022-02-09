import {evaluate} from "certlogic-js"

import {Rule, Rules} from "./types"
import {insertReferenceData} from "./reference-data"
import {dependenciesOf, replaceWithResults, ResultsMap} from "./resultOf-utils"
import {inDependencyOrder} from "../utils/topological-sort"


export type RuleEvaluation = {
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
 * or an array of {@link RuleEvaluation} objects, in dependency order.
 */
export type Evaluation = false | RuleEvaluation[]


/**
 * Computes the the version of the given {@link Rule} applicable on the given `now` time,
 * as the index in the array of the rule's versions.
 * If no version is applicable, then a value of -1 is returned.
 */
const indexOfApplicableVersion = ({ validTo, versions }: Rule, now: Date): number =>
    (validTo !== undefined && new Date(validTo) < now)
        ? -1
        : versions.reduce((previous: number, current, index) =>
            previous === -1 || new Date(current.validFrom) <= now && new Date(versions[previous].validFrom) < new Date(current.validFrom)
                ? index : previous,
            -1
        )

export const evaluateRules = (rules: Rules, now: Date, data: any): Evaluation => {
    const ruleEvals = rules.rules.map((rule) =>                        // compute (index of) applicable version for all rules
            ({
                rule,
                indexOfApplicableVersion: indexOfApplicableVersion(rule, now)
            })
        )
        .filter(({indexOfApplicableVersion}) =>                     // filter out rules without applicable version
            indexOfApplicableVersion > -1
        )
        .map(({ rule, indexOfApplicableVersion }) =>          // create a RuleEvaluation instance for each applicable rule's version
            ({
                rule,
                indexOfApplicableVersion,
                dependencies: dependenciesOf(rule.versions[indexOfApplicableVersion].logic),
                result: undefined   // set `result` to undefined for the moment
            })
        )
    const id2RuleEval = Object.fromEntries(
        ruleEvals.map((ruleEval) =>
            [ ruleEval.rule.id, ruleEval ]
        )
    )
    const evaluation = inDependencyOrder(ruleEvals, (ruleEval) => ruleEval.dependencies.map((ruleId) => id2RuleEval[ruleId]))
    if (evaluation === false) {
        return false
    }
    /*
     * Alternatively, something like:...
        const dependencyOrder = inDependencyOrder(Object.keys(id2RuleEval), (ruleId) => id2RuleEval[ruleId].dependencies)
        if (dependencyOrder === false) {
            return false
        }
     */

    insertReferenceData(data, rules.referenceDataSlots)
    const resultsMap = evaluation
        .reduce((resultsMap: ResultsMap, { rule, indexOfApplicableVersion }) =>
                ({
                    ...resultsMap,
                    [rule.id]: evaluate(replaceWithResults(rule.versions[indexOfApplicableVersion].logic, resultsMap), data)
                }),
            {}
        )
    evaluation.forEach((ruleEval) => {
        ruleEval.result = resultsMap[ruleEval.rule.id]  // set `result` to actual result
    })
    return evaluation
}

