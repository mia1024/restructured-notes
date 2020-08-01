import zipFile from "jszip"
import {
    existsSync,
    mkdir,
    readdir,
    lstat,
    readFile,
    createWriteStream,
} from "fs"
import {promisify} from "util";
import {join} from "path";
import {sleep} from "./utils";

const readFileAsync = promisify(readFile)
const mkdirAsync = promisify(mkdir)
const readdirAsync = promisify(readdir)
const lstatAsync = promisify(lstat)


export async function unzip(file: string, destination: string) {
    try {
        let counter = 0
        if (existsSync(destination)) {
            if ((await lstatAsync(destination)).isDirectory()) {
                if ((await readdirAsync(destination)).length != 0) {
                    throw Error('Unzip destination exists')
                }
            } else {
                throw Error('Unzip destination exists')
            }
        }
        let zip = new zipFile()
        let content = await readFileAsync(file)
        await zip.loadAsync(content, {createFolders: true})
        await mkdirAsync(destination, {recursive: true})

        for (let [path, obj] of Object.entries(zip.files)) {
            let fp = join(destination, path)
            if (obj.dir) {
                await mkdirAsync(fp, {recursive: true})
            } else {
                obj.nodeStream().pipe(createWriteStream(fp)
                    .on('open', () => counter++)
                    .on('close', () => counter--)
                )
            }
        }
        if (counter != 0)
            await sleep(10)
    } catch (e) {
        throw e
    }
}
