import {Rule} from "dcc-business-rules-utils"
import {writeFileSync} from "fs"

import {pretty} from "../../utils/json"
import {migrateRules} from "./rules-migrator"


const oldRules: Rule[] = require(`../../../tmp/all-rules.json`)
const migratedRules = migrateRules(oldRules)
writeFileSync("tmp/all-rules-migrated.json", pretty(migratedRules))
    // TODO  un-Git-ignore this file later on

console.log(`migrated ${oldRules.length} (versions of) rules to ${migratedRules.length} Business Rules-instances.`)

