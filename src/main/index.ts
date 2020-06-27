import {app, BrowserWindow, nativeTheme, screen, dialog, nativeImage, shell} from 'electron'
import * as path from 'path'
import {format as formatUrl} from 'url'
import {configDirPath, configFilePath, UserConfig, initRepoAndCommitAll} from "src/common";
import {existsSync, mkdirSync, unlinkSync} from "fs";

const isDevelopment = process.env.NODE_ENV !== 'production'
if (isDevelopment) {
    app.setName('Restructured Notes')
    let dataDir = path.join(app.getPath('appData'), 'Restructured Notes')
    let fs = require('fs')
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
    //app.setPath('userData',path.join(app.getPath('appData'),'Restructured Notes'))
}

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null;
const isMacOS = process.platform === 'darwin'

const appIcon = nativeImage.createFromPath('src/assets/icon.png')
if (isMacOS) {
    app.dock.setIcon(appIcon)
}


function createMainWindow() {
    const {width, height} = screen.getPrimaryDisplay().size
    const window = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                additionalArguments: [nativeTheme.shouldUseDarkColors.toString()]
            },
            show: false,
            frame: true,
            titleBarStyle: isMacOS ? "hiddenInset" : undefined,
            width: width * 0.8,
            height: height * 0.8

            //icon: path.join(__dirname, "../assets/icon" + (os.platform() === "darwin" ? ".icns" : ".png"))
        }
    )

    if (isDevelopment) {
        window.webContents.openDevTools()

    }

    if (isDevelopment) {
        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    } else {
        window.loadURL(formatUrl({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file',
            slashes: true
        }))
    }

    window.on('closed', () => {
        mainWindow = null
    })

    window.once('ready-to-show', () => {
        window.show()
    })

    window.webContents.on('devtools-opened', () => {
        window.focus()
        setImmediate(() => {
            window.focus()
        })
    })

    return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (!isMacOS) {
        app.quit()
    }
})

app.on('activate', () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow()
    }
})

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
    if (!existsSync(configDirPath)) {
        // setting up the user data directory
        mkdirSync(configDirPath, {recursive: true, mode: 0o700})
        new UserConfig().save()
        try {
            await initRepoAndCommitAll(configDirPath)
        } catch (e) {

            dialog.showErrorBox('Error',e.toString())
        }
    }

    let config: UserConfig;
    try {
        config = new UserConfig
    } catch (e) {
        dialog.showMessageBox({
            type: 'error',
            title: 'Invalid Configuration',
            message: 'Unable to load the current configuration file due to the following error:',
            buttons: ["Quit", "Revert to default configs"],
            defaultId: 0,
            cancelId: 0,
            detail: e.toString(),
            noLink: true,
            checkboxLabel: "Show config.yml in file manager?",
            checkboxChecked: true
        }).then(ans => {
            console.log(ans)
            if (ans.checkboxChecked)
                shell.showItemInFolder(configFilePath)

            if (ans.response === 0)
                app.quit()
            else {
                unlinkSync(configFilePath)
                config = new UserConfig
                config.save()
            }
        })
    }

    mainWindow = createMainWindow()
})

