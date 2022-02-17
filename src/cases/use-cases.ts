import {UseCase} from "./types"
import buttonModule from "./button-module/button-module"
import NLBorderCustoms from "./NL-border-customs/NL-border-customs"
import colourAssessment from "./colour-assessment/colour-assessment"

const useCases: UseCase[] = [
    NLBorderCustoms,
    buttonModule,
    colourAssessment
]

export default useCases

