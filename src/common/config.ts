import {CSS,uuid,configFilePath, configDirPath} from "src/common"
import {existsSync, readFileSync, writeFileSync} from "fs"
import {join as joinPath, resolve} from "path"
import YAML from "yaml"
import merge from "deepmerge"
import {homedir,tmpdir} from "os"


class ColorScheme {
    foregroundColor: string
    backgroundColor: string
    accentColor: string
    highlightColor: string
    shadowColor: string

    constructor(config: { foreground: string, bg: string, accent: string, highlight: string, shadow: string }) {
        this.foregroundColor = config.foreground
        this.backgroundColor = config.bg
        this.accentColor = config.accent
        this.highlightColor = config.highlight
        this.shadowColor = config.shadow
    }
}


export class FileBasedConfig {
    _configPath?: string;

    // this variable cannot be declared private because of subclasses and Object.assign

    save(path?: string): void {
        let pathToWrite = path ?? this._configPath
        if (pathToWrite === undefined) {
            throw Error("A path to write must be specified either in object constructor or as an argument")
        }
        const serialized = YAML.stringify(this, {indent: 4, simpleKeys: true})
        writeFileSync(pathToWrite, serialized)
    }

    loadFromDisk(path?: string): void {
        let pathToRead = path ?? this._configPath
        if (pathToRead === undefined) {
            throw Error("A path to read must be specified either in object constructor or as an argument")
        }

        const config = YAML.parse(readFileSync(pathToRead, {encoding: "utf8"}))
        Object.assign(this, merge(this, config))
        this._configPath ??= path
    }

    constructor(path?: string) {
        this._configPath = path;
        Object.defineProperty(this, '_configPath', {
            writable: true,
            enumerable: false
            // prevent it from showing up in serialized configs
        })
    }
}

// ---------------------- Default Settings -------------------


export class UserConfig extends FileBasedConfig {
    public UIStyle = new UIStyle
    public git = new Git
    public gpg = new GPG
    public useDarkMode!: boolean;
    public notebookBaseDir: string = resolve(homedir(), "Restructured Notes");
    public showWelcomeScreen: boolean = true

    private static instance?: UserConfig;

    public reload() {
        this.loadFromDisk()
    }


    // @ts-ignore: TS2376
    // this is needed for UserConfig to be a singleton
    constructor() {

        if (UserConfig.instance !== undefined) {
            return UserConfig.instance
        }

        super(configFilePath)

        if (existsSync(configFilePath))
            if (process.env.NODE_ENV === "production")
                try {
                    this.loadFromDisk()
                } catch (e) {
                    console.error("Error while parsing configuration file: ", e)
                    throw e
                    //console.log(JSON.stringify(e))
                }
            else
                console.log("bypassing config.yml in development")

        switch (process.type) {
            case "renderer":
                this.useDarkMode = false
                // this value should already be set in config.yml,
                // so here we are only adding a placeholder
                break
            case "browser":
                const electron = require("electron")
                this.useDarkMode = electron.nativeTheme.shouldUseDarkColors
                break
            default:
                this.useDarkMode = true
        }
        UserConfig.instance = this
    }
}

class Git {
    public name = ""
    public email = ""
    public gpgsign = false
    public useGPGAgent = false
    // if gpgsign is true but useGPGAgent is false,
    // then the js implementation of gpg will be used,
    // otherwise, a shell escape to the installed gpg agent
    // will be used
}

class GPG {
    signKey = ""
    encryptKey = ""
    executable = "gpg"
}


class UIStyle {
    public globalStyle: CSS = {
        "font-family": "\"Roboto Mono\", \"Courier New\", Courier, monospaced",
        "font-size": "16px",
        "font-weight": 300,
    }

    public toolbarStyle: CSS = {
        "font-family": "inherit",
        "font-size": "inherit",
        "color": "inherit",
        "background-color": "inherit"
    };
    public darkTheme = new ColorScheme(
        {
            foreground: "#ffffff",
            bg: "#121212",
            accent: "#bb86fc",
            highlight: "#03dac6",
            shadow: "rgba(0,0,0,0.5)"
        })
    public lightTheme = new ColorScheme(
        {
            foreground: "#000000",
            bg: "#ffffff",
            accent: "#8bc34a",
            highlight: "#03a9f4",
            shadow: "rgba(0,0,0,0.5)"
        }
    )
}

// ----------------------------------------------------------
