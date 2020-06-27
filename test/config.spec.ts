import expect from 'expect'
import {FileBasedConfig} from "src/common";
import {tmpdir} from "os"
import {join} from 'path'
import {readFileSync, writeFileSync,unlinkSync} from "fs";


describe("src/common/config.ts",()=>{
    class TestConfig extends FileBasedConfig{
        public field1='a'
        public field2='b'
    }
    const filePath=join(tmpdir(),'testConfig.yml')
    it("saves settings to the disk",()=>{
        let config=new TestConfig()
        expect(config.field1).toBe('a')
        expect(config.field2).toBe('b')
        config.field2='c'
        config.save(filePath)
        let content=readFileSync(filePath,'utf8')
        expect(content).toBe(`field1: a\nfield2: c\n`)
    })

    it("loads settings from the disk",()=>{
        let config=new TestConfig()
        writeFileSync(filePath,`field1: a\nfield2: c\n`)
        config.loadFromDisk(filePath)
        expect(config.field1).toBe('a')
        expect(config.field2).toBe('c')
        expect(config instanceof TestConfig).toBeTruthy()
    })

    it('throws an error with broken configuration',()=>{
        let config=new TestConfig()
        writeFileSync(filePath,`a: \n  - b\n c\n`)
        expect(()=>config.loadFromDisk(filePath)).toThrowError()
    })
    after(()=>{
        unlinkSync(filePath)
    })
})