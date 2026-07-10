import { useCallback, useEffect, useState } from 'react'
import { agentStudioData } from '../data/agentStudioMock'
import type { DashboardData, TaskSnapshot } from '../types/dashboard'

export type AgentStudioActions = {
  createTask: (prompt: string) => Promise<void>
  runTask: () => Promise<void>
  pauseTask: () => Promise<void>
  clearLogs: () => Promise<void>
  refresh: () => Promise<void>
  pickContext: (kind: 'files' | 'folder') => Promise<void>
  shareTask: () => Promise<void>
  openArtifact: (artifactId: string) => Promise<void>
}

function mergeSnapshot(current: DashboardData, snapshot: TaskSnapshot): DashboardData {
  if ((snapshot.revision ?? -1) < (current.revision ?? -1)) {
    return current
  }

  return {
    ...current,
    ...snapshot,
  }
}

export function useAgentStudio() {
  const [data, setData] = useState<DashboardData>(agentStudioData)
  const [isBusy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const agent = typeof window === 'undefined' ? undefined : window.desktop?.agent

  const applySnapshot = useCallback((snapshot: TaskSnapshot) => {
    setData(current => mergeSnapshot(current, snapshot))
    setError(null)
  }, [])

  const execute = useCallback(async (operation: () => Promise<TaskSnapshot>) => {
    setBusy(true)

    try {
      applySnapshot(await operation())
    } catch (operationError) {
      setError(operationError instanceof Error ? operationError.message : 'The backend request failed')
      throw operationError
    } finally {
      setBusy(false)
    }
  }, [applySnapshot])

  useEffect(() => {
    if (!agent) {
      return
    }

    let isActive = true
    const unsubscribe = agent.onStateChanged(snapshot => {
      if (isActive) {
        applySnapshot(snapshot)
      }
    })

    void agent.getSnapshot()
      .then(snapshot => {
        if (isActive) {
          applySnapshot(snapshot)
        }
      })
      .catch(loadError => {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load task state')
        }
      })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [agent, applySnapshot])

  const unavailable = useCallback(async () => {
    throw new Error('The persistent task backend is available in the Electron desktop application')
  }, [])

  const actions: AgentStudioActions = {
    createTask: prompt => execute(() => agent ? agent.createTask(prompt) : unavailable()),
    runTask: () => execute(() => agent ? agent.runTask() : unavailable()),
    pauseTask: () => execute(() => agent ? agent.pauseTask() : unavailable()),
    clearLogs: () => execute(() => agent ? agent.clearLogs() : unavailable()),
    refresh: () => execute(() => agent ? agent.getSnapshot() : unavailable()),
    pickContext: kind => execute(() => agent ? agent.pickContext(kind) : unavailable()),
    shareTask: () => execute(() => agent ? agent.shareTask() : unavailable()),
    openArtifact: async artifactId => {
      setBusy(true)

      try {
        if (!agent) {
          await unavailable()
          return
        }

        await agent.openArtifact(artifactId)
        setError(null)
      } catch (operationError) {
        setError(operationError instanceof Error ? operationError.message : 'Unable to open artifact')
        throw operationError
      } finally {
        setBusy(false)
      }
    },
  }

  return { data, actions, isBusy, error }
}
