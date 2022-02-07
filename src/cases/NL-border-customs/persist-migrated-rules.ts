import {writeFileSync} from "fs"

import convertedRules from "./rules-migrator"


writeFileSync("src/cases/NL-border-customs/rules.json", JSON.stringify(convertedRules, null, 2))

