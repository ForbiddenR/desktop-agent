import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('desktop', {
  isDesktop: true,
  platform: process.platform,
  versions: {
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    node: process.versions.node,
  },
  windowControls: {
    minimize: () => ipcRenderer.send('window:minimize'),
    toggleMaximize: () => ipcRenderer.send('window:toggle-maximize'),
    close: () => ipcRenderer.send('window:close'),
  },
  agent: {
    getSnapshot: () => ipcRenderer.invoke('agent:get-snapshot'),
    createTask: (prompt: string) => ipcRenderer.invoke('agent:create-task', prompt),
    runTask: () => ipcRenderer.invoke('agent:run-task'),
    pauseTask: () => ipcRenderer.invoke('agent:pause-task'),
    clearLogs: () => ipcRenderer.invoke('agent:clear-logs'),
    pickContext: (kind: 'files' | 'folder') => ipcRenderer.invoke('agent:pick-context', kind),
    shareTask: () => ipcRenderer.invoke('agent:share-task'),
    openArtifact: (artifactId: string) => ipcRenderer.invoke('agent:open-artifact', artifactId),
    onStateChanged: (listener: (snapshot: unknown) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, snapshot: unknown) => listener(snapshot)
      ipcRenderer.on('agent:state-changed', handler)
      return () => ipcRenderer.removeListener('agent:state-changed', handler)
    },
  },
})
