import rules from "../../../src/cases/BE-rules/rules"
import {writeJson} from "../../utils/json"


// also serialise, for diffing:
writeJson("src/cases/BE-rules/rules.json", rules)

