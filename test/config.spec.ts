import expect from 'expect'
import {configDirPath, FileBasedConfig, NotebookConfig, UserConfig} from "src/common";
import {tmpdir} from "os"
import {join} from 'path'
import {readFileSync, writeFileSync, unlinkSync, existsSync, rmdirSync, mkdirSync} from "fs";


describe("src/common/config.ts", () => {
    before(() => {
        expect(process.type).toBeUndefined()
        // this ensures that configDirPath is set to a temp directory
        // so we don't accidentally delete the real config file

        if (existsSync(configDirPath))
            unlinkSync(configDirPath)
        mkdirSync(configDirPath, {recursive: true})
    })


    after(() => {
        unlinkSync(filePath)
        rmdirSync(configDirPath)
    })

    class TestConfig extends FileBasedConfig {
        public field1 = 'a'
        public field2 = 'b'
    }

    const filePath = join(tmpdir(), 'testConfig.yml')
    it("FileBasedConfig saves settings to the disk", () => {
        let config = new TestConfig
        expect(config.field1).toBe('a')
        expect(config.field2).toBe('b')
        config.field2 = 'c'
        config.save(filePath)

        let content = readFileSync(filePath, 'utf8')
        expect(content).toBe(`field1: a\nfield2: c\n`)
        unlinkSync(filePath)

        config = new TestConfig(filePath)
        expect(config.field1).toBe('a')
        expect(config.field2).toBe('b')
        config.field2 = 'c'
        config.save()
        content = readFileSync(filePath, 'utf8')
        expect(content).toBe(`field1: a\nfield2: c\n`)
    })

    it("FileBasedConfig loads settings from the disk", () => {
        let config = new TestConfig()
        writeFileSync(filePath, `field1: b\nfield2: c\n`)
        config.loadFromDisk(filePath)
        expect(config.field1).toBe('b')
        expect(config.field2).toBe('c')
        expect(config instanceof TestConfig).toBeTruthy()

        config = new TestConfig(filePath)
        expect(config.field1).toBe('a')
        expect(config.field2).toBe('b')
        writeFileSync(filePath, `field1: b\nfield2: c\n`)
        config.loadFromDisk()
        expect(config.field1).toBe('b')
        expect(config.field2).toBe('c')
        expect(config instanceof TestConfig).toBeTruthy()
    })

    it('FileBasedConfig throws an error with broken configuration', () => {
        let config = new TestConfig()
        writeFileSync(filePath, `a: \n  - b\n c\n`)
        expect(() => config.loadFromDisk(filePath)).toThrowError()
    })

    it('UserConfig is a singleton', () => {
        let config = new UserConfig()
        let anotherConfig = new UserConfig()
        expect(config === anotherConfig).toBeTruthy()
    })


})
