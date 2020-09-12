import zipFile from "jszip"
import {
    existsSync,
    mkdir,
    readdir,
    lstat,
    readFile,
    writeFile,
} from "fs"
import {promisify} from "util";
import {join} from "path";
import {sleep} from "./utils";

const readFileAsync = promisify(readFile)
const mkdirAsync = promisify(mkdir)
const readdirAsync = promisify(readdir)
const lstatAsync = promisify(lstat)
const writeFileAsync = promisify(writeFile)

export async function unzip(src: string, dest: string) {
    try {
        let counter = 0
        if (existsSync(dest)) {
            if ((await lstatAsync(dest)).isDirectory()) {
                if ((await readdirAsync(dest)).length != 0) {
                    throw Error('Unzip destination exists')
                }
            } else {
                throw Error('Unzip destination exists')
            }
        }
        let zip = new zipFile()
        let content = await readFileAsync(src)
        await zip.loadAsync(content, {createFolders: true})
        await mkdirAsync(dest, {recursive: true})

        for (let [path, obj] of Object.entries(zip.files)) {
            let fp = join(dest, path)
            if (obj.dir) {
                await mkdirAsync(fp, {recursive: true})
            } else {
                let bin = await obj.async('nodebuffer')
                await writeFileAsync(join(dest,path),bin)
            }
        }
        if (counter != 0)
            await sleep(10)
    } catch (e) {
        throw e
    }
}

async function zipDir(zip:zipFile,path:string){
    for (let fp of (await readdirAsync(path,{withFileTypes:true}))){
        if (fp.isFile()){
            zip.file(fp.name,await readFileAsync(join(path,fp.name)))
        } else if (fp.isDirectory()){
            let childZip=zip.folder(fp.name)
            if (childZip)
                await zipDir(childZip,join(path,fp.name))
        }
    }
}

/** zip a single folder
 * @param src - the source folder
 * @param dest - the destination zip file
 */
export async function zip(src:string,dest:string) {
    let zip=new zipFile()
    if (!(await lstatAsync(src)).isDirectory())
        throw Error("Source of the zip is not a directory")
    await zipDir(zip,src)
    let buf=await zip.generateAsync({
        platform:process.platform==='win32'?'DOS':'UNIX',
        compression:'DEFLATE',
        compressionOptions:{
            level:9
        },
        type:"nodebuffer"
    })
    await writeFileAsync(dest,buf)
}

