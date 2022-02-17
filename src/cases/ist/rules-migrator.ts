import {Rule, RuleType} from "dcc-business-rules-utils"

import {Rules as NewRules, Rule as NewRule} from "../../engine/types"
import {sortBy, unique} from "../../utils/functional"


// (convenience function; could go to functional utils:)
type GroupMap<T> = { [key: string]: T[] }
const groupBy = <T>(array: T[], keyFunc: (t: T) => string): GroupMap<T> =>
    array.reduce((acc: GroupMap<T>, value) => {
        const key = keyFunc(value)
        if (acc[key] === undefined) {
            acc[key] = []
        }
        acc[key].push(value)
        return acc
    }, {})


/**
 * Migrates the given versions of the rule with given ID `ruleId` to a Business Rules-instance.
 */
const migrateRuleVersions = (ruleId: string, ruleVersions: Rule[]): NewRule => {
    const sortedRuleVersions = sortBy(
        ruleVersions,
        (ruleVersion) => new Date(ruleVersion.ValidFrom).getTime()
    ).reverse()
    return {
        id: ruleId,
        validTo: sortedRuleVersions[0].ValidTo,
        versions: sortedRuleVersions.map((ruleVersion) =>
            ({
                validFrom: ruleVersion.ValidFrom,
                logic: ruleVersion.Logic
            })
        )
    }
}


/**
 * Selects all rules with the given (country, type), and migrates these to a Business Rules-instance.
 * This function returns `null` if no rules with given (country, type) exist.
 */
const migrateRuleGroup = (country: string, type: RuleType, allOldRules: Rule[]): NewRules | null => {
    const rules = allOldRules.filter((rule) => rule.Country === country && rule.Type === type)
    if (rules.length === 0) {
        return null
    }
    const ruleVersionsPerId = groupBy(rules, (rule) => rule.Identifier)
    return {
        id: `${type.toString().substring(0, 3)}-${country}`,
        rules: Object.entries(ruleVersionsPerId)
            .map(([ruleId, ruleVersions]) =>
                migrateRuleVersions(ruleId, ruleVersions)
            ),
        referenceDataSlots: [
            {
                path: "external.valueSets",
                versions: [
                    {
                        validFrom: "2021-05-01",
                        value: "--insert after the fact--"
                    }
                ]
            }
        ]
    }
}


// convenience function, for use in combination with Array.flatMap(..):
const wrapAsArray = <T>(value: T | null): T[] =>
    value === null ? [] : [value]


/**
 * Migrates rules in the current format to the new format.
 */
export const migrateRules = (rules: Rule[]): NewRules[] => {
    const countryCodes = unique(rules.map((rule) => rule.Country))
    return countryCodes.flatMap((country) =>
        [
            ...wrapAsArray(migrateRuleGroup(country, "Acceptance", rules)),
            ...wrapAsArray(migrateRuleGroup(country, "Invalidation", rules))
        ]
    )
}

