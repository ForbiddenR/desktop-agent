import type { TaskSnapshot } from './dashboard'

export {}

declare global {
  interface Window {
    desktop?: {
      isDesktop: true
      platform: NodeJS.Platform
      versions: {
        chrome?: string
        electron?: string
        node?: string
      }
      windowControls?: {
        minimize: () => void
        toggleMaximize: () => void
        close: () => void
      }
      agent?: {
        getSnapshot: () => Promise<TaskSnapshot>
        createTask: (prompt: string) => Promise<TaskSnapshot>
        runTask: () => Promise<TaskSnapshot>
        pauseTask: () => Promise<TaskSnapshot>
        clearLogs: () => Promise<TaskSnapshot>
        pickContext: (kind: 'files' | 'folder') => Promise<TaskSnapshot>
        shareTask: () => Promise<TaskSnapshot>
        openArtifact: (artifactId: string) => Promise<boolean>
        onStateChanged: (listener: (snapshot: TaskSnapshot) => void) => () => void
      }
    }
  }
}
