import {PathLike, writeFileSync} from "fs"
import {pretty} from "../../src/utils/json"


export const writeJson = (path: PathLike, json: unknown): void => {
    writeFileSync(path, pretty(json))
}

