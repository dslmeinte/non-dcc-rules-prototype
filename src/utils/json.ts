
export const pretty = (data: unknown): string =>
    JSON.stringify(data, null, 2)


export const tryParse = (text: string): unknown => {
    try {
        return JSON.parse(text)
    } catch (e) {
        return e
    }
}


import Ajv from "ajv"
import { ErrorObject } from "ajv"
const ajv = new Ajv({
    allErrors: true,        // don't stop after 1st error
    strict: true,
    validateSchema: false   // prevent that AJV throws with 'no schema with key or ref "https://json-schema.org/draft/2020-12/schema"'
})
const addFormats = require("ajv-formats")
addFormats(ajv)


// (not exported through index.ts:)
export const createSchemaValidator = (schema: any): (json: any) => ErrorObject[] => {
    const ajvSchemaValidator = ajv.compile(schema)
    return (json: any): ErrorObject[] => {
        const valid = ajvSchemaValidator(json)
        return valid ? [] : ajvSchemaValidator.errors!
    }
}

// TODO  make adding multiple schema files possible

