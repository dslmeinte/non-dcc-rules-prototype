import {PathLike, writeFileSync} from "fs"

export const writeJson = (path: PathLike, data: any) => {
    writeFileSync(path, JSON.stringify(data, null, 2))
}

