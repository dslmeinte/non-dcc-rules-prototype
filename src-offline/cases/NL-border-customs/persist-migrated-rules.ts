import convertedRules from "../../../src/cases/NL-border-customs/rules-migrator"
import {writeJson} from "../../utils/json"


writeJson("src/cases/NL-border-customs/rules.json", convertedRules)

