import {CertLogicExpression} from "certlogic-js"
// import {JSONSchema7} from "json-schema"


/**
 * We implicitly (and silently) extend the CertLogicExpression type with the following operation.
 * We'll replace occurrences of this type with a value obtained by the evaluation of the rule referenced.
 */
export type ResultOf = {
    "resultOf": [
        ruleId: string
    ]
}

const couldBeOperation = (expr: unknown): expr is object =>
    typeof expr === "object" && !Array.isArray(expr) && Object.keys(expr as object).length === 1

export const isResultOf = (expr: unknown): expr is ResultOf =>
    couldBeOperation(expr) && Object.keys(expr)[0] === "resultOf"

export const resultOf_ = (ruleId: string): CertLogicExpression =>
    ({ resultOf: [ruleId] }) as any as CertLogicExpression


export type ReferenceDataSlot = {
    path: string
    value: any
    // TODO  version values
}

export type Rules = {
    id: string
    description?: string
    rules: Rule[]   // a bit confusing: Rules.rules...leave for now...
    referenceDataSlots: ReferenceDataSlot[]
    // dataSchema: JSONSchema7  <== use convention: data.schema.json next to rules.json
}

export type Rule = {
    id: string  // no specific format: could use current format but not necessary
    description?: string // only one, non-i18n description: i18n is a UI concerns which should not be solved by the rule
    validTo?: string // one optional end date for the rule's validity
    versions: RuleVersion[]
}

export type RuleVersion = {
    validFrom: string
    logic: CertLogicExpression  // actually: CertLogicExpression extended with the ResultOf operation
}

