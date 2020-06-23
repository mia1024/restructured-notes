import {Style as CSS} from "./style";
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


class Style {
    UIStyle = new UIStyle
}

export class FileBasedConfig {
    save(path?: string): void {
        if (path === undefined) path = joinPath(configDirPath, 'config.yml')
        let serialized = YAML.stringify(this)
        writeFileSync(path, serialized)
    }

    loadFromDisk(path?: string): void {
        if (path === undefined) path = joinPath(configDirPath, 'config.yml')
        let config = YAML.parse(readFileSync(path, {encoding: 'utf8'}))
        Object.assign(this, merge(this, config))
    }

    constructor() {
        if (existsSync(joinPath(configDirPath, 'config.yml'))) {
            if (process.env.NODE_ENV === 'production')
                this.loadFromDisk()
        }

        // always update with the latest copy of default configs
        if (process.type === 'renderer')
            window.addEventListener('beforeunload', e => {
                this.save()
            })
    }
}

// ---------------------- Default Settings -------------------

export default class UserConfig extends FileBasedConfig {
    public style = new Style
    public useDarkMode: boolean = window.process.argv[-1] === 'true'
}

class UIStyle {
    public toolbarStyle: CSS = {
        'font-family': '"Courier New", monospaced',
        'font-size': '16px'
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