import expect from 'expect'
import {configDirPath} from "src/common";
import {getDB} from "src/common/db";

describe('src/common/db',()=>{
    it('opens a db without error',async ()=>{
        let db=await getDB()
        expect(db.initCompleted).toBeTruthy()
        expect(db.initError).toBeFalsy()
    })
})