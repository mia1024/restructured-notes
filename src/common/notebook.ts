import {
    FileBasedConfig,
    initRepoAndCommitAll,
    openRepo,
    UserConfig,
    uuid,
    sleep,
    isConfigModified,
    commitConfigFileAndTag
} from "src/common"
import {
    existsSync,
    lstatSync,
    mkdirSync,
    readdirSync,
    readFile,
    readFileSync,
    realpathSync,
    rmdirSync,
    unlinkSync
} from "fs";
import {Repository} from "nodegit";
import {join as joinPath, parse as parsePath, resolve as resolvePath} from "path"
import zipFile from "jszip"
import {tmpdir} from "os";
import {showErrorWindow} from "../renderer";
import {promisify} from "util";

const supportedFileTypes = ['.md', '.txt']

export class NotebookConfig extends FileBasedConfig {
    name!: string;
    // this is used for display purpose
    // because the directory name will be
    // normalized per POSIX standard
    public readonly uuid!: string;

    constructor(path: string, create: boolean = false, name?: string) {
        super(joinPath(path, 'config.yml'));
        if (create)
            if (name === undefined)
                throw Error("The notebook's name must be defined during creation")
            else {
                this.name = name
                this.uuid = uuid()
            }
        else {
            this.loadFromDisk()
            if (this.uuid === undefined)
                throw Error("Invalid Notebook configuration: uuid must be defined")
            if (this.name === undefined)
                throw Error("Invalid Notebook configuration: name must be defined")
        }

    }
}


/**
 The Notebook class. Do not use the constructor.
 Use createNotebook() instead
 */
class Notebook {

    // a notebook is, in essence, a git repo
    // with a bunch of files, each of which
    // may be encrypted
    public config!: NotebookConfig
    public path!: string;
    public rootCollection!: Collection
    public repo!: Repository
    protected _initError?: Error
    protected _initCompleted: boolean = false

    get initError() {
        return this._initError
    }

    get initCompleted() {
        return this._initCompleted
    }

    async save() {
        this.config.save()
        if (await isConfigModified(this.path)) {
            await commitConfigFileAndTag(this.path)
        }
    }


    constructor(path: string, create: boolean = false, name?: string) {
        if (create) {
            if (name === undefined) {
                this._initError = Error("The notebook's name must be defined during creation")
                this._initCompleted = true
                return
            }

            if (existsSync(path)) {
                let stat = lstatSync(path)
                if (stat.isSymbolicLink()) {
                    // this shouldn't happen because createNotebook()
                    // pass in a real path. but we should check it anyway
                    this._initError = Error("The path specified is a symlink")
                    this._initCompleted = true
                    return
                }

                if (!stat.isDirectory()) {
                    this._initError = Error("The path specified is not a directory")
                    this._initCompleted = true
                    return
                }
            }
            let notebookPath = resolvePath(path, convertFilename(name))
            if (existsSync(notebookPath))
                if (!lstatSync(notebookPath).isDirectory()) {
                    this._initError = Error('File ' + notebookPath + ' already exists')
                    this._initCompleted = true
                    return;
                }

            mkdirSync(notebookPath, {recursive: true})
            if (readdirSync(notebookPath).length !== 0) {
                this._initError = Error('Directory ' + notebookPath + ' already exists')
                this._initCompleted = true
                return;
            }

            try {
                this.config = new NotebookConfig(notebookPath, create, name)
                this.config.save()
            } catch (e) {
                this._initError = e
                this._initCompleted = true
                return;
            }
            this.path = notebookPath
            this.rootCollection = new Collection(this)

            initRepoAndCommitAll(notebookPath, `Created notebook ${name}`).then((repo) => {
                this.repo = repo
            }).catch(e => {
                this._initError = e
            }).finally(() => {
                this._initCompleted = true
            })
        } else { // loading notebook
            if (!existsSync(joinPath(path, 'config.yml')))
                if (name) { // try a few other possible paths
                    path = joinPath(path, name)
                    if (!existsSync(joinPath(path, 'config.yml')))
                        path = normalizeNotebookPath(path)
                }

            try {
                this.config = new NotebookConfig(path)
            } catch (e) {
                this._initError = e
                this._initCompleted = true
                return;
            }
            this.path = realpathSync(path)
            this.rootCollection = new Collection(this)

            openRepo(path).then((repo) => {
                this.repo = repo
            }).catch(e => {
                this._initError = e
            }).finally(() => {
                this._initCompleted = true
            })
        }
    }

}

class compressedNotebook extends Notebook{
    public nominalPath!:string;

    constructor(path:string, create:boolean=false, name?:string,nominalPath?:string) {
        if (create&&name) {
            let tmpPath = joinPath(tmpdir(), 'restructured-notes', name)
            if (existsSync(tmpPath)) {
                showErrorWindow({
                    title: 'Tmp directory exists',
                    message: 'This may be a result of previous crashes. Will attempt to recover'
                })
                if (lstatSync(tmpPath).isDirectory())
                    rmdirSync(tmpPath,{recursive:true})
                else
                    unlinkSync(tmpPath)
            }
            mkdirSync(tmpPath,{recursive:true})
            super(tmpPath,create,name)
            this.nominalPath=path
        } else {
            super(path) // the archive will be decompressed by openNotebook
            if (this.initError)
                return
            if (!nominalPath)
            {
                this._initError=Error('No nominal path provided')
                this._initCompleted=true
                return
            }
            this.nominalPath=nominalPath
        }
    }

    async save(){
        let readFileAsync=promisify(readFile)
        await super.save()
        let zip=new zipFile()
        let config=await readFileAsync(joinPath(this.path,'config.yml'))
        zip.file('config.yml',config)
        for (let col of this.rootCollection) {
            if (col instanceof Note){
                await
                zip.file(col.path)
            }
        }
        zip.generateAsync()
    }

}

export type {Notebook}

/** converts a filename into a github compatible name
 *
 * @param fn the filename
 * @return a proper path for the specific platform
 */
function convertFilename(fn: string): string {
    let o = fn
        .replace(/\s/g, '-')
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        .replace(/[\/?<>\\:*|"]/g, '-')
        .replace(/^\.$/, 'dot')
        .replace(/^\.$/, 'dot-dot')
    if (process.platform == 'win32') {
        o = o.replace(/[. ]+$/, '')
            .replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, '-$1$2')
    }
    return o
}

export function normalizeNotebookPath(p: string): string {
    let parsed = parsePath(p)
    return joinPath(parsed.dir, convertFilename(parsed.base))
}

/** Create a notebook into the directory and initialize its git repository.
 * A new directory will always be created inside
 * the specified path or the default folder.
 *
 * @param name The name of the notebook to create
 * @param path Optional. If omitted, the notebookBaseDir in user config will be used
 */

export async function createNotebook(name: string, path?: string) {
    const config = new UserConfig()
    path ??= resolvePath(config.notebookBaseDir, name)
    path = realpathSync(path)

    let notebook = new Notebook(path, true, name)
    while (true) {
        if (notebook.initCompleted) {
            if (notebook.initError)
                throw notebook.initError
            return notebook
        }
        await sleep(10)
        // this is a long enough time?
    }
}

/** Opens a notebook at a specific location
 *
 * @param path the path of the notebook, or the parent folder of the notebook if name is given
 * @param name optional. the name of the notebook for additional lookup
 */
export async function openNotebook(path: string, name?: string): Promise<Notebook> {

    let notebook = new Notebook(path, false, name)
    // this is intentionally not normalized
    // as a user may drop a notebook folder
    // into the app without a normalized name
    // which would have been problematic if
    // the path were normalized

    while (true) {
        if (notebook.initCompleted) {
            if (notebook.initError)
                throw notebook.initError
            return notebook
        }
        await sleep(10)
    }
}


export class Note {

    public path: string;

    /**
     *
     * @param path: the path relative to the notebook root
     */
    constructor(path: string) {
        this.path = path
    }
}

/**
 * A Collection is a container for notes and collections.
 * Its filesystem representation is a folder under the
 * notebook's root directory.
 */
export class Collection {
    notebook: Notebook;
    path: string
    parent?: Collection
    children: (Collection | Note)[]

    constructor(notebook: Notebook, parent?: Collection, name?: string) {
        this.notebook = notebook
        this.parent = parent
        this.children = []

        if (parent === undefined) { // root collection
            this.path = '.'
        } else {
            if (name === undefined)
                throw Error('The name of the collection must be given when parent is given')
            this.path = joinPath(parent.path, name)
        }

        let dir = readdirSync(joinPath(this.notebook.path, this.path), {withFileTypes: true})
        for (let fp of dir) {
            if (fp.name === '.git') {
                // do nothing
            } else if (fp.isDirectory()) {
                let col = new Collection(notebook, this, fp.name)
                this.children.push(col)
                // we permit the existence of potentially empty collections
            } else if (fp.isFile()) {
                let ext = parsePath(fp.name).ext
                if (supportedFileTypes.includes(ext)) {
                    // we only check it here in case the user wants to
                    // manually add some files to the notebook
                    let note = new Note(joinPath(this.path, fp.name))
                    this.children.push(note)
                }
            }
        }
    }

    * getAllNotes(): Generator<Note> {
        for (let child of this.children) {
            if (child instanceof Note) {
                yield child
            } else
                yield* child.getAllNotes()
        }
    }

    * [Symbol.iterator]() {
        for (let child of this.children) {
            yield child
        }
    }
}




class EncryptedNote extends Note {
    // TODO
}
