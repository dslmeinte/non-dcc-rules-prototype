/**
 * Put the given `things` into dependency order.
 * Dependencies are computed with the given `dependenciesFunction`.
 * @returns An array of the same things (assuming the things is its own transitive closure of the dependencies),
 *  but in dependency order, or false when there's a cycle.
 */
export const inDependencyOrder = <T>(things: T[], dependenciesFunction: (t: T) => T[]): T[] | false => {
    const ordered: T[] = []

    const visit = (current: T, chain: T[]) => {
        if (ordered.indexOf(current) > -1) {
            return false
        }
        if (chain.indexOf(current) > -1) {
            return true
        }
        const extendedChain = [ ...chain, current ]
        const hasCycle = dependenciesFunction(current).some(
            (dependency) => visit(dependency, extendedChain)
        )
        ordered.push(current)
        return hasCycle
    }

    const hasCycle = things.some(
        (thing) => visit(thing, [])
    )

    return hasCycle ? false : ordered     // equivalent to: !hasCycle && ordered
}

