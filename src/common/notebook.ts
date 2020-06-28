import {UserConfig, FileBasedConfig} from "src/common"
import {existsSync, lstatSync, mkdirSync, readdirSync} from "fs";
import {initRepoAndCommitAll, openRepo} from "src/common";
import {Repository} from "nodegit";
import {join as joinPath, resolve} from "path"
import {uuid} from "src/common";

const config = new UserConfig()


export class NotebookConfig extends FileBasedConfig {
    name!: string;
    // this is used for display purpose
    // because the directory name will be
    // normalized per POSIX standard
    uuid!:string;

    constructor(path: string, create: boolean = false, name?: string) {
        super(joinPath(path, 'config.yml'));
        if (create)
            if (name === undefined)
                throw Error("The notebook's name must be defined during creation")
            else {
                this.name = name
                this.uuid = uuid()
            }
        else{
            this.loadFromDisk()
            if (this.uuid===undefined)
                throw Error("Invalid Notebook configuration: uuid must be defined")
            if (this.name===undefined)
                throw Error("Invalid Notebook configuration: name must be defined")
        }

    }
}

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
                    this._initError = Error("The path specified is a symlink")
                    this._initCompleted = true
                    return
                }

                if (!stat.isDirectory()) {
                    this._initError = Error("The path specified is not a directory")
                    this._initCompleted = true
                    return
                }
                if (readdirSync(path).length !== 0) {
                    this._initError = Error("The directory is not empty")
                    this._initCompleted = true
                    return
                }
            }

            mkdirSync(path, {recursive: true})
            try {
                this.config = new NotebookConfig(path, create, name)
                this.config.save()
            } catch (e) {
                this._initError = e
                this._initCompleted = true
                return;
            }
            this.path = path
            this.notes = []
            initRepoAndCommitAll(path).then((repo) => {
                this.repo = repo
            }).catch(e => {
                this._initError = e
            }).finally(() => {
                this._initCompleted = true
            })
        } else {
            try {
                this.config = new NotebookConfig(path)
            } catch (e) {
                this._initError = e
                this._initCompleted = true
                return;
            }
            this.path = path
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
    // relative to the notebook folder
    public path: string;


    constructor(path: string) {
        this.path = path
    }
}

function sleep(ms: number) {
    return new Promise((r => setTimeout(r, ms)))
}

export type {Notebook}

export async function createNotebook(name: string, path?: string): Promise<Notebook> {
    // TODO: sanitize name
    path ??= resolve(config.notebookBaseDir, name)
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

export async function openNotebook(path: string): Promise<Notebook> {
    let notebook = new Notebook(path)
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