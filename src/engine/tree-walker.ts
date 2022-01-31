import {CertLogicExpression, CertLogicOperation} from "certlogic-js"
import { isInt } from "certlogic-js/dist/internals"


export type OperationData = {
    operator: string
    values: string | any[]
}

export const operationDataFrom = (expr: CertLogicOperation): OperationData => {
    const keys = Object.keys(expr)
    if (keys.length !== 1) {
        throw new Error(`expression object must have exactly one key, but it has ${keys.length}`)
    }
    const operator = keys[0]
    const values = (expr as any)[operator]
    return { operator, values }
}


/**
 * Flat-maps over all constituent sub expressions of a given CertLogic expression (including that “root” expression itself),
 * calling the given `mapper` function with every sub expression “walked over” - i.e. visited during the tree-walk -,
 * and concatenating the returned values in one, big list.
 * The sub expressions are visited in a “leaf-to-root” fashion.
 *
 * This function may be useful for searching for occurrences of certain operations, and such.
 */
export function treeFlatMap<T>(rootExpr: CertLogicExpression, mapper: (expr: CertLogicExpression) => T[]): T[] {
    const map_ = (expr: CertLogicExpression): T[] => {
        if (typeof expr === "string" || isInt(expr) || typeof expr === "boolean") {
            return mapper(expr)
        }
        if (Array.isArray(expr)) {
            return (expr as CertLogicExpression[]).flatMap(map_)
        }
        if (typeof expr === "object") {
            const { operator, values } = operationDataFrom(expr)
            if (operator === "var") {
                return mapper(expr)
            }
            return [ ...(values as CertLogicExpression[]).flatMap(mapper), ...mapper(expr) ]
        }
        throw new Error(`invalid CertLogic expression: ${expr}`)    // (never reached)
    }
    return map_(rootExpr)
}

