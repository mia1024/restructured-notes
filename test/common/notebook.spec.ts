import {join} from "path";
import {tmpdir} from "os";
import {mkdirSync, realpathSync, rmdirSync, symlinkSync, writeFileSync} from "fs";
import {
    Collection,
    createNotebook,
    normalizeNotebookPath,
    Note,
    Notebook,
    NotebookConfig,
    openNotebook
} from "src/common";
import expect from 'expect'
import {execSync} from "child_process";
import Collator = Intl.Collator;

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
        await createNotebook(notebookName, testDir,false)
        let notebook = await openNotebook(testDir,'path',notebookName)
        expect(notebook.repo).not.toBeUndefined()
        expect(notebook.initError).toBeUndefined()
        expect(notebook.initCompleted).toBeTruthy()
        expect(notebook.config.name).toBe(notebookName)
        expect(notebook.config.uuid).not.toBeUndefined()
    })

    it('throws an error when opening a blank folder as notebook', async () => {
        await expect(openNotebook(testDir,'path')).rejects.toThrow(/config\.yml/gi)
    })

    it('throws an error when opening a folder without git', async () => {
        writeFileSync(join(testDir, 'config.yml'), 'name: a\nuuid: a-b-c-d\n')
        await expect(openNotebook(testDir,'path')).rejects.toThrow(/repository/gi)
    })


    it('throws an error loading notebook into a file', async () => {
        const testFile = join(testDir, 'testFile')
        writeFileSync(testFile, '')
        await expect(createNotebook('testNotebook', testFile,false)).rejects.toThrow(/not a directory/gi)
    })

    it('creates the notebook into the real path of a symlink directory', async () => {
        mkdirSync(join(testDir, 'test'))
        symlinkSync('./test', join(testDir, 'test2'))
        expect((await createNotebook('testNotebook', join(testDir, 'test2'), false)).path)
            .toBe(realpathSync(join(testDir, 'test', 'testNotebook')))
    })

    it('normalizes notebook directory name correctly', function () {
        if (process.platform == 'win32')
            this.skip()
        expect(normalizeNotebookPath('/home/user/restructured notes/restructured notes'))
            .toBe('/home/user/restructured notes/restructured-notes')

    })

    it('throws an error while trying to create two notebooks with the same name at the same place', async () => {
        let notebook = await createNotebook('test notebook', testDir)
        expect(createNotebook('test notebook', testDir)).rejects.toThrowError(/directory .+ already exists/gi)
    })

    it('throws an error while trying create a notebook with the same name as an existing file', async () => {
        writeFileSync(join(testDir, 'test-notebook'), '')
        expect(createNotebook('test notebook', testDir)).rejects.toThrowError(/file .+ already exists/gi)
    })

    it('commits and tags config.yml correctly', async () => {
        let notebook = await createNotebook('test', testDir)
        notebook.config.name = 'test2'
        await notebook.save()
        let output = execSync('git --no-pager tag -l', {cwd: notebook.path, encoding: 'utf8'})
        expect(output.trim()).toBe('LastWorkingConfig')
    })

    it('creates collections correctly', async () => {
        let notebook = await createNotebook('test', testDir)
        await notebook.save()
        mkdirSync(join(testDir, 'test', 'col1'), {recursive: true})
        mkdirSync(join(testDir, 'test', 'col2'), {recursive: true})
        mkdirSync(join(testDir, 'test', 'col1', 'col3'), {recursive: true})
        writeFileSync(join(testDir, 'test', 'col1', 'col3', 'test.md'), '')
        writeFileSync(join(testDir, 'test', 'col1', 'test2.md'), '')
        writeFileSync(join(testDir, 'test', 'col2', 'test3.md'), '')
        notebook = await openNotebook(testDir, 'path')
        expect(notebook.rootCollection.path).toBe('.')
        expect(notebook.rootCollection.parent).toBeUndefined()
        expect(notebook.rootCollection.children.length).toBe(2)
        expect(Array.from(notebook.rootCollection.getAllNotes()).length).toBe(3)
        for (let note of notebook.rootCollection.getAllNotes())
            if (process.platform == 'win32')
                expect(['col1\\col3\\test.md', 'col1\\test2.md', 'col2\\test3.md']
                    .includes(note.path)).toBeTruthy()
            else
                expect(['col1/col3/test.md', 'col1/test2.md', 'col2/test3.md']
                    .includes(note.path)).toBeTruthy()

        for (let child of notebook.rootCollection) {
            expect(child instanceof Collection).toBeTruthy()
            expect(['col1','col2','col3'].includes(child.path)).toBeTruthy()
        }
    })
})