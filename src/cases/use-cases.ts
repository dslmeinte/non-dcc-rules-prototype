import {UseCase} from "./types"
import buttonModule from "./button-module/button-module"
import NLBorderCustoms from "./NL-border-customs/NL-border-customs"


const useCases: UseCase[] = [
    NLBorderCustoms,
    buttonModule
]

export default useCases

