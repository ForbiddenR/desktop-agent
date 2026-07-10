import { useEffect, useState } from 'react'
import { ActivityTimeline } from '../main/ActivityTimeline'
import { Composer } from '../main/Composer'
import { LogsPanel } from '../main/LogsPanel'
import { TaskHeader } from '../main/TaskHeader'
import { RightRail } from './RightRail'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import type { DashboardData } from '../../types/dashboard'
import type { AgentStudioActions } from '../../hooks/useAgentStudio'

type AppShellProps = {
  data: DashboardData
  actions: AgentStudioActions
  isBusy: boolean
  error: string | null
}

export function AppShell({ data, actions, isBusy, error }: AppShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [composerFocusRequest, setComposerFocusRequest] = useState(0)

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setComposerFocusRequest(request => request + 1)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <div className="app-page">
      <div className="browser-frame" aria-label="Agent Studio application mockup">
        <Sidebar
          data={data}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewTask={() => {
            setSidebarOpen(false)
            setComposerFocusRequest(request => request + 1)
          }}
        />

        <div
          className={`sidebar-backdrop ${isSidebarOpen ? 'is-open' : ''}`.trim()}
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />

        <div className="workspace-shell">
          <Topbar
            data={data}
            isBusy={isBusy}
            onMenuClick={() => setSidebarOpen(true)}
            onRun={() => void actions.runTask().catch(() => undefined)}
            onPause={() => void actions.pauseTask().catch(() => undefined)}
            onShare={() => void actions.shareTask().catch(() => undefined)}
          />

          <main className="workspace-main">
            <section className="workspace-content" aria-label="Task activity workspace">
              <TaskHeader data={data} />
              <ActivityTimeline items={data.timeline} onOpenArtifact={actions.openArtifact} />
              <Composer
                focusRequest={composerFocusRequest}
                isBusy={isBusy}
                onSubmit={actions.createTask}
                onPickContext={actions.pickContext}
              />
              <LogsPanel
                logs={data.logs}
                timeline={data.timeline}
                isLive={data.taskStatus === 'running'}
                onClear={actions.clearLogs}
                onRefresh={actions.refresh}
                onOpenArtifact={actions.openArtifact}
              />
            </section>

            <RightRail data={data} onAddContext={() => actions.pickContext('files')} />
          </main>
        </div>
      </div>
      {error ? <div className="backend-error" role="alert">{error}</div> : null}
    </div>
  )
}
