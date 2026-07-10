import { app, BrowserWindow, ipcMain, screen, shell, type IpcMainEvent } from 'electron'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL ?? 'http://127.0.0.1:5173'

let mainWindow: BrowserWindow | null = null

function isSafeExternalUrl(url: string) {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:'
  } catch {
    return false
  }
}

function getRendererEntry() {
  return path.join(__dirname, '..', 'dist', 'index.html')
}

function isAllowedNavigation(url: string) {
  if (!app.isPackaged) {
    return url.startsWith(DEV_SERVER_URL)
  }

  return url === pathToFileURL(getRendererEntry()).href
}

function windowFromWebContents(event: IpcMainEvent) {
  return BrowserWindow.fromWebContents(event.sender) ?? mainWindow
}

function getInitialWindowBounds() {
  const { workAreaSize } = screen.getPrimaryDisplay()
  const width = Math.min(1440, Math.max(960, workAreaSize.width - 40), workAreaSize.width)
  const height = Math.min(1040, Math.max(560, workAreaSize.height - 24), workAreaSize.height)

  return {
    width,
    height,
    minWidth: Math.min(960, width),
    minHeight: Math.min(560, height),
  }
}

function registerWindowControls() {
  ipcMain.on('window:minimize', event => {
    windowFromWebContents(event)?.minimize()
  })

  ipcMain.on('window:toggle-maximize', event => {
    const window = windowFromWebContents(event)

    if (!window) {
      return
    }

    if (window.isMaximized()) {
      window.unmaximize()
    } else {
      window.maximize()
    }
  })

  ipcMain.on('window:close', event => {
    windowFromWebContents(event)?.close()
  })
}

function createWindow() {
  const bounds = getInitialWindowBounds()

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: bounds.minWidth,
    minHeight: bounds.minHeight,
    show: false,
    frame: false,
    title: 'Agent Studio',
    autoHideMenuBar: true,
    backgroundColor: '#f8f8f9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webviewTag: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) {
      void shell.openExternal(url)
    }

    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', event => {
    const targetUrl = event.url

    if (isAllowedNavigation(targetUrl)) {
      return
    }

    event.preventDefault()

    if (isSafeExternalUrl(targetUrl)) {
      void shell.openExternal(targetUrl)
    }
  })

  if (app.isPackaged) {
    void mainWindow.loadFile(getRendererEntry())
  } else {
    void mainWindow.loadURL(DEV_SERVER_URL)
  }
}

app.whenReady().then(() => {
  registerWindowControls()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
