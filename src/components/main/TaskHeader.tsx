import { Expand, FileCode2 } from 'lucide-react'
import { StatusPill } from '../ui/StatusPill'
import type { DashboardData } from '../../types/dashboard'

type TaskHeaderProps = {
  data: DashboardData
}

export function TaskHeader({ data }: TaskHeaderProps) {
  return (
    <header className="task-header">
      <div className="task-header__title">
        <FileCode2 size={18} />
        <h1>{data.taskTitle}</h1>
      </div>

      <div className="task-header__meta">
        <StatusPill status={data.taskStatus}>Running</StatusPill>
        <span className="task-header__elapsed">{data.elapsed}</span>
        <button className="icon-button" type="button" aria-label="Expand task view">
          <Expand size={17} />
        </button>
      </div>
    </header>
  )
}
