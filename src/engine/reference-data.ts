import {ReferenceDataSlot} from "./types"
import {isValidWithin} from "./validity"


const setValueAtPathInData = (value: any, path: string, data: any): void => {
    path.split(".").reduce((subData, fragment, index, fragments) => {
        let subSubData = subData[fragment]
        if (!subSubData) {
            subSubData = index + 1 < fragments.length ? {} : value
            subData[fragment] = subSubData
        }
        return subSubData
    }, data)
}


export const insertReferenceData = (data: any, referenceDataSlots: ReferenceDataSlot[], date: Date) => {
    referenceDataSlots.forEach(({ path, versions }) => {
        const version = versions.find(isValidWithin(date))
        if (version !== undefined) {
            setValueAtPathInData(version.value, path, data)
        }   // else: don't add reference data in slot
    })
    return data
}

