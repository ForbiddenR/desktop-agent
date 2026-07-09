import { ChevronDown, Menu, MoreHorizontal, Pause, Play, Share2 } from 'lucide-react'
import { NavIcon } from '../ui/NavIcon'
import type { DashboardData } from '../../types/dashboard'

type TopbarProps = {
  data: DashboardData
  onMenuClick: () => void
}

export function Topbar({ data, onMenuClick }: TopbarProps) {
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
        <button className="toolbar-button" type="button">
          <Play size={15} fill="currentColor" />
          <span>Run</span>
        </button>
        <button className="toolbar-button" type="button">
          <Pause size={15} fill="currentColor" />
          <span>Pause</span>
        </button>
        <button className="toolbar-button" type="button">
          <Share2 size={15} />
          <span>Share</span>
        </button>
        <button className="icon-button" type="button" aria-label="More actions">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </header>
  )
}
