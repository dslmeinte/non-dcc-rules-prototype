import convertedRules from "./rules-migrator"
import {writeJson} from "../../utils/json"


writeJson("src/cases/NL-border-customs/rules.json", convertedRules)

