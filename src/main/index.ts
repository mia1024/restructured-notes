import {app, BrowserWindow, screen, dialog, nativeImage, shell, ipcMain, nativeTheme} from "electron"
import * as path from "path"
import {format as formatUrl} from "url"
import {configDirPath, configFilePath, UserConfig, initRepoAndCommitAll} from "src/common"
import {existsSync, mkdirSync, unlinkSync} from "fs"

const isDevelopment = process.env.NODE_ENV !== "production"
if (isDevelopment) {
    app.setName("Restructured Notes")
    const dataDir = path.join(app.getPath("appData"), "Restructured Notes")
    const fs = require("fs")
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)
    //app.setPath('userData',path.join(app.getPath('appData'),'Restructured Notes'))
}

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: BrowserWindow | null
const isMacOS = process.platform === "darwin"

const appIcon = nativeImage.createFromPath("src/assets/icon.png")
if (isMacOS) {
    app.dock.setIcon(appIcon)
}
app.allowRendererProcessReuse = false

let config:UserConfig

function createMainWindow(location:string='/') {
    const {width : screenWidth, height : screenHeight} = screen.getPrimaryDisplay().size
    const window = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
        },
        show: false,
        frame: !isMacOS,
        titleBarStyle: isMacOS ? "hiddenInset" : undefined,
        width: screenWidth * 0.8,
        height: screenHeight * 0.8,
        // transparent:true,
        //backgroundColor: (config.useDarkMode?config.UIStyle.darkTheme:config.UIStyle.lightTheme).backgroundColor
        //icon: path.join(__dirname, "../assets/icon" + (os.platform() === "darwin" ? ".icns" : ".png"))
    }
    )

    if (isDevelopment) {
        window.webContents.openDevTools()

    }

    if (isDevelopment) {
        window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}/#${location}`)
    } else {
        window.loadURL(formatUrl({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file",
            slashes: true,
            hash:location
        }))
    }

    window.on("closed", () => {
        mainWindow = null
    })

    window.once("ready-to-show", () => {
        window.show()
    })

    window.webContents.on("devtools-opened", () => {
        window.focus()
        setImmediate(() => {
            window.focus()
        })
    })

    return window
}

// quit application when all windows are closed
app.on("window-all-closed", () => {
    // on macOS it is common for applications to stay open until the user explicitly quits
    if (!isMacOS) {
        app.quit()
    }
})

app.on("activate", () => {
    // on macOS it is common to re-create a window even after all windows have been closed
    if (mainWindow === null) {
        mainWindow = createMainWindow()
    }
})



app.on("ready", async () => {
    if (!existsSync(configDirPath)) {
        // setting up the user data directory
        mkdirSync(configDirPath, {recursive: true, mode: 0o700})
        let config=new UserConfig()
        config.useDarkMode=nativeTheme.shouldUseDarkColors
        config.save()
        // try {
        //     await initRepoAndCommitAll(configDirPath)
        // } catch (e) {
        //     dialog.showErrorBox("Error", e.toString())
        // }
    }

    try {
        config = new UserConfig
    } catch (e) {
        dialog.showMessageBox({
            type: "error",
            title: "Invalid Configuration",
            message: "Unable to load the current configuration file due to the following error:",
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

if (module.hot){
    module.hot.accept()
}

ipcMain.on('restart',(e,args)=>{
    app.relaunch()
    if (args.immediate){
        app.exit(0)
    }
})

ipcMain.on('error',(e,args)=>{
    dialog.showMessageBoxSync(
        mainWindow as BrowserWindow,{
            type:'error',
            title:args.title,
            message:args.message,
            detail:args.detail
        }
    )
})

ipcMain.on('uncaughtError',(e,args)=>{
    showError(args.error)
})

function showError(e:Error){
    if (mainWindow){
        let id=dialog.showMessageBoxSync(
            mainWindow,
            {
                title: 'Error!',
                message:'Uncaught Error. Please file a bug report.',
                detail:e.stack,
                buttons:['Crash','Just Continue']
            },
        )
        if (id==0){
            app.exit(1)
        }
    } else {
        dialog.showErrorBox('Uncaught Error. Please file a bug report.',e.stack as string)
        app.exit(1)
    }
}


process.on('unhandledRejection',((err)=>{
    showError(err as Error)
}))

process.on('uncaughtException',(err:Error)=>{
    showError(err)
})