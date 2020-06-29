import {UserConfig, FileBasedConfig} from "src/common"
import {existsSync, lstatSync, mkdirSync, readdirSync, realpathSync} from "fs";
import {initRepoAndCommitAll, openRepo} from "src/common";
import {Repository} from "nodegit";
import {join as joinPath, resolve as resolvePath, parse as parsePath} from "path"
import {uuid} from "src/common";

const config = new UserConfig()


export class NotebookConfig extends FileBasedConfig {
    name!: string;
    // this is used for display purpose
    // because the directory name will be
    // normalized per POSIX standard
    uuid!: string;

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
    public notes!: Note[]
    public repo!: Repository
    protected _initError?: Error
    protected _initCompleted: boolean = false

    get initError() {
        return this._initError
    }

    get initCompleted() {
        return this._initCompleted
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
            mkdirSync(notebookPath, {recursive: true})
            try {
                this.config = new NotebookConfig(notebookPath, create, name)
                this.config.save()
            } catch (e) {
                this._initError = e
                this._initCompleted = true
                return;
            }
            this.path = notebookPath
            this.notes = []
            initRepoAndCommitAll(notebookPath).then((repo) => {
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
            this.notes = []
            let files = readdirSync(path)
            for (let f of files)
                this.notes.push(new Note(f))

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


class Note {

    public path: string;

    /**
     *
     * @param path: the path relative to the notebook root
     */
    constructor(path: string) {
        this.path = path
    }
}

function sleep(ms: number) {
    return new Promise((r => setTimeout(r, ms)))
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

/** Create a notebook into the directory. A new directory will always be created inside
 * the specified path or the default folder.
 *
 * @param name The name of the notebook to create
 * @param path Optional. If omitted, the notebookBaseDir in user config will be used
 */

export async function createNotebook(name: string, path?: string) {
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
        // this is a pretty long time??
    }
}

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

class EncryptedNote extends Note {
    // TODO
}