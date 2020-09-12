import {tmpdir} from "os"
import {join} from "path"
import {existsSync, mkdirSync, readFileSync, rmdirSync, writeFileSync} from "fs";
import {unzip,zip} from "src/common";
import {execSync} from "child_process";
import expect from "expect"

// @ts-ignore: TS2339. This variable is injected in setup.js
let cleanup: boolean = global.performCleanup

describe('src/common/zip.ts', () => {
    let testDir: string;

    beforeEach(() => {
        testDir = join(tmpdir(), 'test-rstnotes', 'test' + Math.random())
        mkdirSync(testDir, {recursive: true})
    })
    afterEach(() => {
        if (cleanup)
            rmdirSync(join(tmpdir(), 'test-rstnotes'), {recursive: true})
    })

    it('unzips archive correctly', async () => {
        mkdirSync(join(testDir,'test'))
        mkdirSync(join(testDir,'test','a'))
        mkdirSync(join(testDir,'test','b','c'),{recursive:true})
        mkdirSync(join(testDir,'test','d'))
        writeFileSync(join(testDir,'test','a','test.txt'),'Test a\n')
        writeFileSync(join(testDir,'test','b','test.txt'),'Test b\n')
        writeFileSync(join(testDir,'test','b','c','test.txt'),'Test c\n')
        execSync('zip -r test.zip test', {
            cwd: testDir,
            encoding: 'utf8',
        })
        await unzip(join(testDir,'test.zip'),join(testDir,'unzipped'))
        expect(existsSync(join(testDir,'unzipped','test','a'))).toBeTruthy()
        expect(existsSync(join(testDir,'unzipped','test','b','c'))).toBeTruthy()
        expect(existsSync(join(testDir,'unzipped','test','d'))).toBeTruthy()
        expect(readFileSync(join(testDir,'unzipped','test','a','test.txt'),{encoding:'utf8'})).toBe('Test a\n')
        expect(readFileSync(join(testDir,'unzipped','test','b','test.txt'),{encoding:'utf8'})).toBe('Test b\n')
        expect(readFileSync(join(testDir,'unzipped','test','b','c','test.txt'),{encoding:'utf8'})).toBe('Test c\n')
    })

    it('zips archive correctly',async()=>{
        mkdirSync(join(testDir,'test'))
        mkdirSync(join(testDir,'test','e'))
        mkdirSync(join(testDir,'test','f','g'),{recursive:true})
        mkdirSync(join(testDir,'test','h'))
        writeFileSync(join(testDir,'test','e','test.txt'),'Test e\n')
        writeFileSync(join(testDir,'test','f','test.txt'),'Test f\n')
        writeFileSync(join(testDir,'test','f','g','test.txt'),'Test g\n')
        await zip(join(testDir,'test'),join(testDir,'test.zip'))
        await unzip(join(testDir,'test.zip'),join(testDir,'unzipped'))
        expect(existsSync(join(testDir,'unzipped','e'))).toBeTruthy()
        expect(existsSync(join(testDir,'unzipped','f','g'))).toBeTruthy()
        expect(existsSync(join(testDir,'unzipped','h'))).toBeTruthy()
        expect(readFileSync(join(testDir,'unzipped','e','test.txt'),{encoding:'utf8'})).toBe('Test e\n')
        expect(readFileSync(join(testDir,'unzipped','f','test.txt'),{encoding:'utf8'})).toBe('Test f\n')
        expect(readFileSync(join(testDir,'unzipped','f','g','test.txt'),{encoding:'utf8'})).toBe('Test g\n')
    })
})