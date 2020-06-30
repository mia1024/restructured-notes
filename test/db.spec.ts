import expect from 'expect'
import {closeDB, getDB} from "src/common/db";
import {join} from "path";
import {tmpdir} from "os";
import {existsSync, mkdirSync, renameSync, rmdirSync} from "fs";
import {configDirPath, createNotebook, Notebook, openNotebook} from "../src/common";

// @ts-ignore: TS2339. This variable is injected in setup.js
let cleanup: boolean = global.performCleanup

describe('src/common/db', () => {
    let testDir: string;
    before(() => {
        expect(process.type).toBeUndefined()
        // this ensures that configDirPath is set to a temp directory
        // so we don't accidentally delete the real config file

        mkdirSync(configDirPath, {recursive: true})
    })


    beforeEach(() => {
        testDir = join(tmpdir(), 'test-rstnotes', 'test' + Math.random())
        mkdirSync(testDir, {recursive: true})
    })


    after(async () => {
        await closeDB()
        if (cleanup) {
            rmdirSync(join(tmpdir(), 'test-rstnotes'), {recursive: true})
            rmdirSync(configDirPath, {recursive: true})
        }
    })

    it('opens a db without error', async () => {
        let db = await getDB()
        expect(db.initCompleted).toBeTruthy()
        expect(db.initError).toBeFalsy()
    })

    it('saves a notebook correctly', async () => {
        let db = await getDB()
        let notebook = await createNotebook('test notebook', testDir)
        await db.addOrUpdateNotebook(notebook)
        let path = await db.getNotebookPath(notebook.config.uuid)
        expect(path).toBe(notebook.path)
    })

    it('saves multiple notebooks correctly', async () => {
        // that is, each uuid is truly random

        let db = await getDB()

        let notebook = await createNotebook('test notebook', testDir)
        let notebook2 = await createNotebook('test notebook2', testDir)

        await db.addOrUpdateNotebook(notebook)
        await db.addOrUpdateNotebook(notebook2)

        let path = await db.getNotebookPath(notebook.config.uuid)
        let path2 = await db.getNotebookPath(notebook2.config.uuid)

        expect(path).toBe(notebook.path)
        expect(path2).toBe(notebook2.path)
    })

    it('updates notebook correctly', async () => {
        let db = await getDB()

        let notebook: Notebook | null = await createNotebook('test notebook', testDir)
        await db.addOrUpdateNotebook(notebook)
        expect(await db.getNotebookPath(notebook.config.uuid)).toBe(notebook.path)
        let oldPath = notebook.path
        notebook = null
        renameSync(oldPath, join(testDir, 'tes nodebook'))
        notebook = await openNotebook(join(testDir, 'tes nodebook'))
        await db.addOrUpdateNotebook(notebook)
        expect(await db.getNotebookPath(notebook.config.uuid)).toBe(notebook.path)


    })
})