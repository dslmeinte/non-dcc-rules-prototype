export type WithValidity = {
    validFrom: string
    /**
     * `undefined` ~ valid indefinitely
     */
    validTo?: string
}

export const isValidWithin = (date: Date) => ({ validFrom, validTo }: WithValidity): boolean =>
    new Date(validFrom) <= date && (validTo === undefined || (date < new Date(validTo)))

