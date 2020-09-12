import expect from "expect"
import {tmpdir} from "os"
import {join} from 'path'
import {mkdirSync, rmdirSync, writeFileSync,} from "fs";
import {
    initRepoAndCommitAll,
    autoCommitEmail,
    autoCommitName,
    isConfigModified,
    commitConfigFileAndTag, tagHEAD, createNotebook
} from "src/common";
import {execSync} from "child_process";
import clean = Mocha.utils.clean;

// @ts-ignore: TS2339. This variable is injected in setup.js
let cleanup: boolean = global.performCleanup


describe("src/common/git.ts", () => {
    let testDir: string;

    beforeEach(() => {
        testDir = join(tmpdir(), 'test-rstnotes', 'test' + Math.random())
        mkdirSync(testDir, {recursive: true})
    })
    afterEach(() => {

        if (cleanup)
            rmdirSync(join(tmpdir(), 'test-rstnotes'), {recursive: true})
    })

    it("creates initial commit correctly", async () => {
        writeFileSync(join(testDir, 'test'), 'test git')
        let repo = await initRepoAndCommitAll(testDir, 'created test notebook')
        let commit = await repo.getHeadCommit()
        expect(commit.author().email()).toBe(autoCommitEmail)
        expect(commit.author().name()).toBe(autoCommitName)
        expect(commit.message()).toBe('created test notebook')
        expect(commit.parentcount()).toBe(0)
    })

    it("tags HEAD correctly", async () => {
        writeFileSync(join(testDir, 'test'), 'test git')
        let repo = await initRepoAndCommitAll(testDir, 'created test notebook')
        await tagHEAD(repo, 'test')
        let output = execSync('git --no-pager tag -l', {cwd: testDir, encoding: 'utf8'})
        expect(output.trim()).toBe('test')
    })

    it("detects change in config.yml", async () => {
        writeFileSync(join(testDir, 'config.yml'), 'data 1')
        execSync(`
         git init
         git config commit.gpgsign false
         git config user.name ${autoCommitName}
         git config user.email ${autoCommitEmail}
         git add .
         git commit -m test
         `, {
            cwd: testDir,
            encoding: 'utf8',
            shell: process.platform === 'win32' ? 'powershell' : 'sh'
        }) // powershell is needed for multiline scripts
        writeFileSync(join(testDir, 'config.yml'), 'data 2')
        expect(await isConfigModified(testDir)).toBeTruthy()
    })

})