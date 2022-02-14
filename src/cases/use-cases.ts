import {UseCase} from "./types"
import buttonModule from "./button-module/button-module"
import NLBorderCustoms from "./NL-border-customs/NL-border-customs"
import colourAssessment from "./colour-assessment/colour-assessment"
import BERules from "./BE-rules/BE-rules"

const useCases: UseCase[] = [
    NLBorderCustoms,
    buttonModule,
    colourAssessment,
    BERules
]

export default useCases

// TODO  validate each use case before running

