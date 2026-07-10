import { ChevronDown, Circle, Expand, RotateCw } from 'lucide-react'
import { useState } from 'react'
import type { LogEntry, TimelineItem } from '../../types/dashboard'

type TabName = 'logs' | 'terminal' | 'tools' | 'artifacts'

type LogsPanelProps = {
  logs: LogEntry[]
  timeline: TimelineItem[]
  isLive: boolean
  onClear: () => Promise<void>
  onRefresh: () => Promise<void>
  onOpenArtifact: (artifactId: string) => Promise<void>
}

export function LogsPanel({
  logs,
  timeline,
  isLive,
  onClear,
  onRefresh,
  onOpenArtifact,
}: LogsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabName>('logs')
  const [isExpanded, setExpanded] = useState(false)
  const [onlyEngineLogs, setOnlyEngineLogs] = useState(false)
  const artifacts = timeline.filter(item => item.kind === 'artifact')
  const toolCalls = timeline.filter(
    (item): item is Exclude<TimelineItem, { kind: 'summary' }> => item.kind !== 'summary',
  )
  const visibleLogs = onlyEngineLogs ? logs.filter(log => log.source === 'Task Engine') : logs
  const tabs: Array<{ id: TabName; label: string }> = [
    { id: 'logs', label: 'Logs' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'tools', label: 'Tool Calls' },
    { id: 'artifacts', label: `Artifacts (${artifacts.length})` },
  ]

  return (
    <section
      className={`logs-panel ${isExpanded ? 'is-expanded' : 'is-collapsed'}`.trim()}
      aria-label="Execution output"
    >
      <div className="logs-panel__tabs" role="tablist" aria-label="Output views">
        {tabs.map(tab => (
          <button
            className={`logs-panel__tab ${activeTab === tab.id ? 'is-active' : ''}`.trim()}
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="logs-panel__actions">
        <span className={`live-indicator ${isLive ? '' : 'is-idle'}`.trim()}>
          <span aria-hidden="true" /> {isLive ? 'Live' : 'Idle'}
        </span>
        <button
          className="text-button"
          type="button"
          disabled={logs.length === 0}
          onClick={() => void onClear().catch(() => undefined)}
        >
          Clear
        </button>
        <button
          className={`icon-button ${onlyEngineLogs ? 'is-active' : ''}`.trim()}
          type="button"
          aria-label="Show only task engine logs"
          aria-pressed={onlyEngineLogs}
          onClick={() => setOnlyEngineLogs(current => !current)}
        >
          <Circle size={15} />
          <ChevronDown size={13} />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="Refresh output"
          onClick={() => void onRefresh().catch(() => undefined)}
        >
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
        {activeTab === 'logs' ? (
          <div className="log-list">
            {visibleLogs.map(log => (
              <div className="log-row" key={log.id}>
                <span>{log.time}</span>
                <strong>{log.source}</strong>
                <p>{log.message}</p>
              </div>
            ))}
            {visibleLogs.length === 0 ? <div className="empty-tab"><span>No logs available.</span></div> : null}
          </div>
        ) : activeTab === 'terminal' ? (
          <div className="log-list">
            {logs.map(log => (
              <div className="log-row" key={`terminal-${log.id}`}>
                <span>{log.time}</span>
                <strong>$</strong>
                <p>{log.message}</p>
              </div>
            ))}
          </div>
        ) : activeTab === 'tools' ? (
          <div className="log-list">
            {toolCalls.map(item => (
              <div className="log-row" key={`tool-${item.id}`}>
                <span>{item.time}</span>
                <strong>{item.tool}</strong>
                <p>{item.kind === 'code' ? `Created ${item.file}` : item.text}</p>
              </div>
            ))}
          </div>
        ) : artifacts.length > 0 ? (
          <div className="artifact-list">
            {artifacts.map(artifact => (
              <button
                className="artifact-chip"
                key={`output-${artifact.id}`}
                type="button"
                disabled={!artifact.artifactPath}
                onClick={() => void onOpenArtifact(artifact.id).catch(() => undefined)}
              >
                {artifact.artifactLabel}
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-tab">
            <strong>Artifacts</strong>
            <span>No artifacts have been generated yet.</span>
          </div>
        )}
      </div>
    </section>
  )
}
