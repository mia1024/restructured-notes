import {join as joinPath} from "path";
import {tmpdir} from "os";

let configDirPath: string

switch (process.type) {
    case "renderer": {
        const electron = require("electron")
        configDirPath = electron.remote.app.getPath("userData")
        break
    }
    case "browser": {
        const electron = require("electron")
        configDirPath = electron.app.getPath("userData")
        break
    }
    default: {
        configDirPath = tmpdir() // for testing
    }
}


configDirPath = joinPath(configDirPath, "User Data")

const configFilePath = joinPath(configDirPath, "config.yml")
export {configDirPath, configFilePath}

export * from './utils'
export * from "./style"
export * from "./git"

export * from "./config"
export * from './notebook'
