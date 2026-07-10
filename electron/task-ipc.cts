import { BrowserWindow, dialog, ipcMain, shell, type IpcMainInvokeEvent } from 'electron'
import type { TaskBackend } from './task-backend.cjs'

const channels = [
  'agent:get-snapshot',
  'agent:create-task',
  'agent:run-task',
  'agent:pause-task',
  'agent:clear-logs',
  'agent:pick-context',
  'agent:share-task',
  'agent:open-artifact',
] as const

type TaskIpcOptions = {
  backend: TaskBackend
  getMainWindow: () => BrowserWindow | null
  isTrustedUrl: (url: string) => boolean
}

export function registerTaskIpc({ backend, getMainWindow, isTrustedUrl }: TaskIpcOptions) {
  const assertTrustedRenderer = (event: IpcMainInvokeEvent) => {
    const mainWindow = getMainWindow()

    if (
      !mainWindow
      || event.sender !== mainWindow.webContents
      || event.senderFrame !== event.sender.mainFrame
      || !isTrustedUrl(event.senderFrame.url)
    ) {
      throw new Error('Agent Studio rejected an untrusted IPC request')
    }
  }

  ipcMain.handle('agent:get-snapshot', event => {
    assertTrustedRenderer(event)
    return backend.getSnapshot()
  })

  ipcMain.handle('agent:create-task', (event, prompt: unknown) => {
    assertTrustedRenderer(event)

    if (typeof prompt !== 'string') {
      throw new Error('Invalid task description')
    }

    return backend.createTask(prompt)
  })

  ipcMain.handle('agent:run-task', event => {
    assertTrustedRenderer(event)
    return backend.runTask()
  })

  ipcMain.handle('agent:pause-task', event => {
    assertTrustedRenderer(event)
    return backend.pauseTask()
  })

  ipcMain.handle('agent:clear-logs', event => {
    assertTrustedRenderer(event)
    return backend.clearLogs()
  })

  ipcMain.handle('agent:pick-context', async (event, kind: unknown) => {
    assertTrustedRenderer(event)

    if (kind !== 'files' && kind !== 'folder') {
      throw new Error('Invalid context picker type')
    }

    const owner = BrowserWindow.fromWebContents(event.sender) ?? getMainWindow()

    if (!owner) {
      throw new Error('No application window is available')
    }

    const result = await dialog.showOpenDialog(owner, {
      title: kind === 'folder' ? 'Add context folder' : 'Add context files',
      properties: kind === 'folder' ? ['openDirectory'] : ['openFile', 'multiSelections'],
    })

    if (result.canceled || result.filePaths.length === 0) {
      return backend.getSnapshot()
    }

    if (kind === 'folder') {
      return backend.addContextFolder(result.filePaths[0])
    }

    return backend.addContext(result.filePaths)
  })

  ipcMain.handle('agent:share-task', async event => {
    assertTrustedRenderer(event)
    const owner = BrowserWindow.fromWebContents(event.sender) ?? getMainWindow()

    if (!owner) {
      throw new Error('No application window is available')
    }

    const snapshot = backend.getSnapshot()
    const result = await dialog.showSaveDialog(owner, {
      title: 'Export task snapshot',
      defaultPath: `${snapshot.taskTitle.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'task'}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })

    if (result.canceled || !result.filePath) {
      return backend.getSnapshot()
    }

    return backend.exportState(result.filePath)
  })

  ipcMain.handle('agent:open-artifact', async (event, artifactId: unknown) => {
    assertTrustedRenderer(event)

    if (typeof artifactId !== 'string') {
      throw new Error('Invalid artifact identifier')
    }

    const artifactPath = backend.getArtifactPath(artifactId)

    if (!artifactPath) {
      throw new Error('Artifact was not found')
    }

    const error = await shell.openPath(artifactPath)

    if (error) {
      throw new Error(error)
    }

    return true
  })

  return () => {
    channels.forEach(channel => ipcMain.removeHandler(channel))
  }
}
