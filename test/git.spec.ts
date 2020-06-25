import expect from "expect"
import Git from "nodegit"
import {tmpdir} from "os"
import {join} from 'path'
import {writeFileSync} from "fs";
import {initRepoAndCommitAll, autoCommitEmail, autoCommitName} from "../src/common";

describe("src/common/git.ts", () => {
    const testDir = join(tmpdir(), 'test')
    it("creates initial commit correctly", async () => {
        writeFileSync(join(testDir, 'test'), 'test git')
        await initRepoAndCommitAll(testDir)
        let repo = await Git.Repository.open(testDir)
        let commit=await repo.getHeadCommit()
        expect(commit.author().email()).toBe(autoCommitEmail)
        expect(commit.author().name()).toBe(autoCommitName)
        expect(commit.message()).toBe('Initial commit')
        expect(commit.parentcount()).toBe(0)
    })
})