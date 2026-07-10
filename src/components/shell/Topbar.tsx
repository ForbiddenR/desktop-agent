import { ChevronDown, Menu, Minus, MoreHorizontal, Pause, Play, Share2, Square, X } from 'lucide-react'
import { NavIcon } from '../ui/NavIcon'
import type { DashboardData } from '../../types/dashboard'

type TopbarProps = {
  data: DashboardData
  isBusy: boolean
  onMenuClick: () => void
  onRun: () => void
  onPause: () => void
  onShare: () => void
}

function WindowsWindowControls() {
  const desktop = typeof window === 'undefined' ? undefined : window.desktop

  if (!desktop?.windowControls || desktop.platform === 'darwin') {
    return null
  }

  return (
    <div className="windows-window-controls" aria-label="Window controls">
      <button type="button" aria-label="Minimize window" onClick={desktop.windowControls.minimize}>
        <Minus size={14} strokeWidth={2} />
      </button>
      <button type="button" aria-label="Maximize window" onClick={desktop.windowControls.toggleMaximize}>
        <Square size={12} strokeWidth={1.9} />
      </button>
      <button
        className="windows-window-controls__close"
        type="button"
        aria-label="Close window"
        onClick={desktop.windowControls.close}
      >
        <X size={15} strokeWidth={2} />
      </button>
    </div>
  )
}

export function Topbar({ data, isBusy, onMenuClick, onRun, onPause, onShare }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="icon-button topbar__menu"
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu size={19} />
        </button>

        <button className="workspace-selector" type="button">
          <NavIcon name="knowledge" size={18} />
          <span>{data.workspaceName}</span>
          <ChevronDown size={15} />
        </button>
      </div>

      <div className="topbar__center" aria-label="Agent and model controls">
        <button className="agent-selector" type="button">
          <NavIcon name="orchestrator" size={18} />
          <span>{data.selectedAgent}</span>
          <ChevronDown size={15} />
        </button>
        <button className="model-selector" type="button">
          <span>{data.modelName}</span>
          <ChevronDown size={15} />
        </button>
      </div>

      <div className="topbar__actions">
        <button
          className="toolbar-button"
          type="button"
          disabled={isBusy || data.taskStatus !== 'paused'}
          onClick={onRun}
        >
          <Play size={15} fill="currentColor" />
          <span>Run</span>
        </button>
        <button
          className="toolbar-button"
          type="button"
          disabled={isBusy || data.taskStatus !== 'running'}
          onClick={onPause}
        >
          <Pause size={15} fill="currentColor" />
          <span>Pause</span>
        </button>
        <button className="toolbar-button" type="button" disabled={isBusy} onClick={onShare}>
          <Share2 size={15} />
          <span>Share</span>
        </button>
        <button className="icon-button" type="button" aria-label="More actions">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <WindowsWindowControls />
    </header>
  )
}
