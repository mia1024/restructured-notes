import expect from "expect"
import Git from "nodegit"
import {tmpdir} from "os"
import {join} from 'path'
import {mkdirSync, rmdirSync, writeFileSync,} from "fs";
import {initRepoAndCommitAll, autoCommitEmail, autoCommitName, isConfigModified} from "../src/common";
import {execSync} from "child_process";

describe("src/common/git.ts", () => {
    let testDir:string;

    beforeEach(()=>{
        testDir = join(tmpdir(), 'test-rstnotes','test'+Math.random())
        mkdirSync(testDir,{recursive:true})
    })
    afterEach(()=>{
        rmdirSync(testDir,{recursive:true})
    })

    it("creates initial commit correctly", async () => {
        writeFileSync(join(testDir, 'test'), 'test git')
        await initRepoAndCommitAll(testDir)
        let repo = await Git.Repository.open(testDir)
        let commit = await repo.getHeadCommit()
        expect(commit.author().email()).toBe(autoCommitEmail)
        expect(commit.author().name()).toBe(autoCommitName)
        expect(commit.message()).toBe('Initial commit')
        expect(commit.parentcount()).toBe(0)
    })
    it("detects change in config.yml",async ()=>{
        writeFileSync(join(testDir, 'config.yml'), 'data 1')
        execSync(`
         git init
         git config commit.gpgsign false
         git add .
         git commit -m test
         `, {cwd: testDir,encoding:'utf8'})
        writeFileSync(join(testDir, 'config.yml'), 'data 2')
        expect(await isConfigModified(testDir)).toBeTruthy()
    })
})