import { ChevronDown, Circle, Expand, RotateCw } from 'lucide-react'
import { useState } from 'react'
import type { LogEntry } from '../../types/dashboard'

const tabs = ['Logs', 'Terminal', 'Tool Calls', 'Artifacts (2)'] as const

type TabName = (typeof tabs)[number]

type LogsPanelProps = {
  logs: LogEntry[]
}

export function LogsPanel({ logs }: LogsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabName>('Logs')
  const [isExpanded, setExpanded] = useState(false)

  return (
    <section
      className={`logs-panel ${isExpanded ? 'is-expanded' : 'is-collapsed'}`.trim()}
      aria-label="Execution output"
    >
      <div className="logs-panel__tabs" role="tablist" aria-label="Output views">
        {tabs.map(tab => (
          <button
            className={`logs-panel__tab ${activeTab === tab ? 'is-active' : ''}`.trim()}
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="logs-panel__actions">
        <span className="live-indicator">
          <span aria-hidden="true" /> Live
        </span>
        <button className="text-button" type="button">
          Clear
        </button>
        <button className="icon-button" type="button" aria-label="Filter logs">
          <Circle size={15} />
          <ChevronDown size={13} />
        </button>
        <button className="icon-button" type="button" aria-label="Refresh logs">
          <RotateCw size={15} />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label={isExpanded ? 'Collapse logs' : 'Expand logs'}
          aria-expanded={isExpanded}
          onClick={() => setExpanded(current => !current)}
        >
          <Expand size={15} />
        </button>
      </div>

      <div className="logs-panel__content" role="tabpanel">
        {activeTab === 'Logs' ? (
          <div className="log-list">
            {logs.map(log => (
              <div className="log-row" key={log.id}>
                <span>{log.time}</span>
                <strong>{log.source}</strong>
                <p>{log.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-tab">
            <strong>{activeTab}</strong>
            <span>Mock data is ready for this output view.</span>
          </div>
        )}
      </div>
    </section>
  )
}
