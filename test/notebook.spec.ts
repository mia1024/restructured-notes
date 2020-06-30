import {join} from "path";
import {tmpdir} from "os";
import {mkdirSync, realpathSync, rmdirSync, symlinkSync, writeFileSync} from "fs";
import {createNotebook, normalizeNotebookPath, NotebookConfig, openNotebook} from "src/common";
import expect from 'expect'
import {execSync} from "child_process";

// @ts-ignore: TS2339. This variable is injected in setup.js
let cleanup: boolean = global.performCleanup

describe('notebook.spec.ts', () => {
    let testDir: string;

    beforeEach(() => {
        testDir = join(tmpdir(), 'test-rstnotes', 'test' + Math.random())
        mkdirSync(testDir, {recursive: true})
    })

    after(() => {
        if (cleanup)
        rmdirSync(join(tmpdir(), 'test-rstnotes'), {recursive: true})
    })


    it("throws an error when creating a NotebookConfig without a name", () => {
        expect(() => {
            new NotebookConfig(testDir, true)
        })
            .toThrowError("The notebook's name must be defined during creation")
    })

    it("throws an error when loading broken notebook configuration", () => {
        writeFileSync(join(testDir, 'config.yml'), 'name: a\nuuid: a-b-c-d\n')
        let config = new NotebookConfig(testDir)
        expect(config.name).toBe('a')
        expect(config.uuid).toBe('a-b-c-d')

        writeFileSync(join(testDir, 'config.yml'), 'name: a\n')
        expect(() => {
            new NotebookConfig(testDir)
        }).toThrow(/invalid notebook configuration.*/gi)

        writeFileSync(join(testDir, 'config.yml'), 'uuid: 5\n')
        expect(() => {
            new NotebookConfig(testDir)
        }).toThrow(/invalid notebook configuration.*/gi)
    })


    it('creates notebook without a race condition', async () => {
        let notebook = await createNotebook('testNotebook', testDir)
        expect(notebook.repo).not.toBeUndefined()
        expect(notebook.initError).toBeUndefined()
        expect(notebook.initCompleted).toBeTruthy()
    })

    it('loads notebook correctly', async () => {
        const notebookName = 'Test Notebook'
        await createNotebook(notebookName, testDir)
        let notebook = await openNotebook(testDir, notebookName)
        expect(notebook.repo).not.toBeUndefined()
        expect(notebook.initError).toBeUndefined()
        expect(notebook.initCompleted).toBeTruthy()
        expect(notebook.config.name).toBe(notebookName)
        expect(notebook.config.uuid).not.toBeUndefined()
    })

    it('throws an error when opening a blank folder as notebook', async () => {
        await expect(openNotebook(testDir)).rejects.toThrow(/config\.yml/gi)
    })

    it('throws an error when opening a folder without git', async () => {
        writeFileSync(join(testDir, 'config.yml'), 'name: a\nuuid: a-b-c-d\n')
        await expect(openNotebook(testDir)).rejects.toThrow(/repository/gi)
    })


    it('throws an error loading notebook into a file', async () => {
        const testFile = join(testDir, 'testFile')
        writeFileSync(testFile, '')
        await expect(createNotebook('testNotebook', testFile)).rejects.toThrow(/not a directory/gi)
    })

    it('creates the notebook into the real path of a symlink directory', async () => {
        mkdirSync(join(testDir, 'test'))
        symlinkSync('./test', join(testDir, 'test2'))
        expect((await createNotebook('testNotebook', join(testDir, 'test2'))).path)
            .toBe(realpathSync(join(testDir, 'test', 'testNotebook')))
    })

    it('normalizes notebook directory name correctly', () => {
        expect(normalizeNotebookPath('/home/users/restructured notes/restructured notes'))
            .toBe('/home/users/restructured notes/restructured-notes')
    })

    it('throws an error while trying to create two notebooks with the same name at the same place', async () => {
        let notebook = await createNotebook('test notebook', testDir)
        expect(createNotebook('test notebook', testDir)).rejects.toThrowError(/directory .+ already exists/gi)
    })

    it('throws an error while trying create a notebook with the same name as an existing file', async () => {
        writeFileSync(join(testDir,'test-notebook'),'')
        expect(createNotebook('test notebook', testDir)).rejects.toThrowError(/file .+ already exists/gi)
    })

    it('commits and tags config.yml correctly', async () => {
        let notebook= await createNotebook('test',testDir)
        notebook.config.name='test2'
        await notebook.save()
        let output=execSync('git --no-pager tag -l',{cwd:notebook.path,encoding:'utf8'})
        expect(output.trim()).toBe('LastWorkingConfig')
    })
})