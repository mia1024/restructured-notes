import sql from 'sqlite3'
import {configDirPath, Notebook, sleep} from 'src/common'
import {join} from "path";

/**
 *  Abstract interface for database connection. Do not use the constructor directly.
 *  Use getDB() instead.
 */
class Database {
    static instance?: Database
    private db!: sql.Database;
    private _initCompleted: boolean = false;
    private _initError?: Error | null;


    get initCompleted() {
        return this._initCompleted
    }

    get initError() {
        return this._initError
    }

    // it could be a static but this class is already a singleton

    constructor(db?: sql.Database) {
        if (Database.instance !== undefined)
            return Database.instance
        Database.instance = this
        if (db === undefined) {
            this._initError = Error('a database connection must be provided')
            this._initCompleted = true
            return
        }
        this.db = db
        this.db.run(`CREATE TABLE IF NOT EXISTS notebooks (
             uuid char(128) PRIMARY KEY NOT NULL,
             path varchar(${process.platform === 'win32' ? 260 : 4096}) UNIQUE NOT NULL
             );`, (err) => {

            this._initError = err
            this._initCompleted = true
        })
    }

    async addOrUpdateNotebook(notebook: Notebook): Promise<void> {
        let done: boolean = false
        let error: null | Error = null
        this.db.run(
            'INSERT OR REPLACE INTO notebooks (uuid,path) VALUES (?, ?)',
            [notebook.config.uuid, notebook.path],
            (err) => {
                done = true
                error = err
            }
        )
        while (!done)
            await sleep(5)
        if (error)
            throw error
    }

    async getNotebookPath(uuid: string): Promise<null | string> {
        let error: Error | null = null;
        let res: undefined | Object = undefined;
        let completed = false
        this.db.get('SELECT * FROM notebooks WHERE uuid=?', uuid, (err, row) => {
            error = err
            res = row
            completed = true
        })


        while (!completed)
            await sleep(5)

        if (error !== null)
            throw error

        if (res !== undefined)
            return res['path']
        else
            return null
    }

    async close(){
        let err=null;
        let completed=false;
        this.db.close((e)=>{
            err=e
            completed=true
        })
        while (!completed)
            await sleep(5)
        if (err)
            throw err
    }
}

export type {Database}

export async function getDB() {
    if (Database.instance !== undefined)
        return Database.instance

    let creationDone: boolean = false
    let creationError: null | Error = null


    let sqldb = new (sql.verbose().Database)(join(configDirPath, 'db.sqlite3'), (err) => {
        if (err === null)
            creationDone = true
        else
            creationError = err
    })
    while (creationDone)
        await sleep(10)


    if (creationError !== null)
        throw creationError

    let db = new Database(sqldb)
    while (!db.initCompleted)
        await sleep(10)


    if (db.initError != undefined)
        throw db.initError

    return db
}

export async function closeDB() {
    if (Database.instance===undefined)
        return
    await Database.instance.close()
    Database.instance=undefined
}