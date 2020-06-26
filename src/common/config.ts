import {CSS} from "src/common";
import {existsSync, readFileSync, writeFileSync} from 'fs'
import {join as joinPath} from 'path'

import YAML from 'yaml'
import merge from "deepmerge"


let configDirPath: string;

switch (process.type) {
    case 'renderer': {
        let electron = require("electron")
        configDirPath = electron.remote.app.getPath('userData')
        break
    }
    case 'browser': {
        let electron = require("electron")
        configDirPath = electron.app.getPath('userData')
        break
    }
    default: {
        let os = require('os')
        configDirPath = os.tmpdir()
    }
}
configDirPath = joinPath(configDirPath, 'User Data')

const configFilePath = joinPath(configDirPath, 'config.yml')
export {configDirPath, configFilePath}


class ColorScheme {
    foregroundColor: string
    backgroundColor: string
    accentColor: string
    highlightColor: string

    constructor(config: { foreground: string, bg: string, accent: string, highlight: string }) {
        this.foregroundColor = config.foreground
        this.backgroundColor = config.bg
        this.accentColor = config.accent
        this.highlightColor = config.highlight
    }
}


export class FileBasedConfig {
    save(path?: string): void {
        if (path === undefined) path = configFilePath
        let serialized = YAML.stringify(this, {indent: 4, simpleKeys: true})
        writeFileSync(path, serialized)
    }

    loadFromDisk(path?: string): void {
        if (path === undefined) path = configFilePath
        let config = YAML.parse(readFileSync(path, {encoding: 'utf8'}))
        Object.assign(this, merge(this, config))
    }

    constructor() {
        if (existsSync(configFilePath))
            //if (process.env.NODE_ENV === 'production')
            try {
                this.loadFromDisk()
            } catch (e) {
                console.error('Error while parsing configuration file: ', e)
                throw e
                //console.log(JSON.stringify(e))
            }
        // else
        //     console.log('bypassing config.yml in development')

    }
}

// ---------------------- Default Settings -------------------


export class UserConfig extends FileBasedConfig {
    public UIStyle = new UIStyle
    public git = new Git
    public gpg = new GPG
    public useDarkMode: boolean;

    constructor() {
        super()
        switch (process.type) {
            case 'renderer':
                this.useDarkMode = window.process.argv[-1] === 'true'
                break
            case 'browser':
                let electron = require('electron')
                this.useDarkMode = electron.nativeTheme.shouldUseDarkColors
                break
            default:
                this.useDarkMode = true
        }
    }
}

class Git {
    public name: string = ""
    public email: string = ""
    public gpgsign: boolean = false
    public useGPG: boolean = false
}

class GPG {
    signKey: string = ""
    encryptKey: string = ""
    executable: string = "gpg"
}

class UIStyle {
    public globalStyle: CSS = {
        'font-family': '"Roboto Mono", "Courier New", Courier, monospaced',
        'font-size': '16px',
        'font-weight': 300,
    }

    public toolbarStyle: CSS = {
        'font-family': 'inherit',
        'font-size': 'inherit',
        'color': 'inherit',
        'background-color': 'inherit'
    };
    public darkTheme = new ColorScheme(
        {
            foreground: '#ffffff',
            bg: '#121212',
            accent: '#bb86fc',
            highlight: '#03dac6'
        })
    public lightTheme = new ColorScheme(
        {
            foreground: '#000000',
            bg: '#ffffff',
            accent: '#8bc34a',
            highlight: '#03a9f4'
        }
    )
}