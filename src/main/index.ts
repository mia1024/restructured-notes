import {app, BrowserWindow, nativeTheme, screen} from 'electron'
import * as path from 'path'
import {format as formatUrl} from 'url'

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


function createMainWindow() {
    const {width, height} = screen.getPrimaryDisplay().size
    const window = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                additionalArguments: [nativeTheme.shouldUseDarkColors.toString()]
            },
            show: false,
            frame: !isMacOS,
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
app.on('ready', () => {
    mainWindow = createMainWindow()
})
