import { useState } from 'react'
import { ActivityTimeline } from '../main/ActivityTimeline'
import { Composer } from '../main/Composer'
import { LogsPanel } from '../main/LogsPanel'
import { TaskHeader } from '../main/TaskHeader'
import { RightRail } from './RightRail'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import type { DashboardData } from '../../types/dashboard'

type AppShellProps = {
  data: DashboardData
}

export function AppShell({ data }: AppShellProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-page">
      <div className="browser-frame" aria-label="Agent Studio application mockup">
        <Sidebar
          data={data}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div
          className={`sidebar-backdrop ${isSidebarOpen ? 'is-open' : ''}`.trim()}
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />

        <div className="workspace-shell">
          <Topbar data={data} onMenuClick={() => setSidebarOpen(true)} />

          <main className="workspace-main">
            <section className="workspace-content" aria-label="Task activity workspace">
              <TaskHeader data={data} />
              <ActivityTimeline items={data.timeline} />
              <Composer />
              <LogsPanel logs={data.logs} />
            </section>

            <RightRail data={data} />
          </main>
        </div>
      </div>
    </div>
  )
}
