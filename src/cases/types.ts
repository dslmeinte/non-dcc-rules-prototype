import {Rules} from "../engine/types"

export type UseCase = {
    description: string
    rules: Rules
    inputDataSchema: any
    exampleDataOn: (verificationTimestamp: Date) => any,
    explanation: JSX.Element
}

