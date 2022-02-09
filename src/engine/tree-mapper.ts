import {CertLogicExpression, CertLogicOperation} from "certlogic-js"
import {isInt} from "certlogic-js/dist/internals"


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
            const [ operator, values ] = Object.entries(expr)[0]
            if (operator === "var") {
                return mapper(expr)
            }
            return [ ...(values as CertLogicExpression[]).flatMap(map_), ...mapper(expr) ]
        }
        throw new Error(`invalid CertLogic expression: ${expr}`)    // (never reached)
    }
    return map_(rootExpr)
}


export function mapOperations(
            rootExpr: CertLogicExpression,
            replaceFn: (operator: string, values: any) => boolean,
            replacerFn: (operator: string, values: any) => CertLogicExpression
        ): CertLogicExpression {
    const map_ = (expr: CertLogicExpression): CertLogicExpression => {
        if (typeof expr === "string" || isInt(expr) || typeof expr === "boolean") {
            return expr
        }
        if (Array.isArray(expr)) {
            return (expr as CertLogicExpression[]).map(map_)
        }
        if (typeof expr === "object") {
            const [ operator, values ] = Object.entries(expr)[0]
            if (replaceFn(operator, values)) {
                return replacerFn(operator, values)
            }
            return operator === "var"
                ? expr
                : {
                    [operator]: (values as CertLogicExpression[]).map(map_)
                } as CertLogicOperation
        }
        throw new Error(`invalid CertLogic expression: ${expr}`)    // (never reached)
    }
    return map_(rootExpr)
}

