export const pretty = (data: any): string =>
    JSON.stringify(data, null, 2)


export const tryParse = (text: string) => {
    try {
        return JSON.parse(text)
    } catch (e) {
        return e
    }
}

