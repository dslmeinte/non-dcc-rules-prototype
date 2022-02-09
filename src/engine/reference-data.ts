import {ReferenceDataSlot} from "./types"


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


export const insertReferenceData = (data: any, referenceDataSlots: ReferenceDataSlot[]) => {
    referenceDataSlots.forEach(({ path, value }) => {
        setValueAtPathInData(value, path, data)
    })
    return data
}

