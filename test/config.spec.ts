import expect from 'expect'
import {FileBasedConfig} from "../src/renderer/config";
import {tmpdir} from "os";
import {join} from 'path'
import {readFileSync} from "fs";


describe("config.ts",()=>{
    class TestConfig extends FileBasedConfig{
        public field1='a'
        public field2='b'
    }
    let config=new TestConfig()
    const filePath=join(tmpdir(),'testConfig.yml')
    it("saves settings to the disk",()=>{
        expect(config.field1).toBe('a')
        expect(config.field2).toBe('b')
        config.field2='c'
        config.save(filePath)
        let content=readFileSync(filePath,'utf8')
        expect(content).toBe(`field1: a\nfield2: c\n`)
    })

    it("loads settings from the disk",()=>{
        config.loadFromDisk(filePath)
        expect(config.field1).toBe('a')
        expect(config.field2).toBe('c')
        expect(config instanceof TestConfig).toBeTruthy()
    })
})