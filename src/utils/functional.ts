/**
 * Sorts non-destructively w.r.t. order of the numeric keys computed from each item in the array.
 */
export const sortBy = <T, U>(array: T[], keyFn: (t: T) => number): T[] =>
    [...array].sort((l, r) => keyFn(l) - keyFn(r))


/**
 * Reverses non-destructively.
 */
export const reverse = <T>(array: T[]): T[] =>
    [...array].reverse()


/**
 * Makes an array of strings unique.
 */
export const unique = <T extends string>(array: T[]): T[] =>
    [...new Set(array)]

