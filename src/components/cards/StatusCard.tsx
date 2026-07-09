import { LinearProgress } from '../ui/LinearProgress'
import { SectionHeader } from '../ui/SectionHeader'
import { StatusPill } from '../ui/StatusPill'
import { SurfaceCard } from '../ui/SurfaceCard'
import type { DashboardData } from '../../types/dashboard'

type StatusCardProps = {
  data: DashboardData
}

export function StatusCard({ data }: StatusCardProps) {
  return (
    <SurfaceCard className="status-card" aria-labelledby="task-status-title">
      <SectionHeader
        title="Task Status"
        meta={<StatusPill status={data.taskStatus}>Running</StatusPill>}
      />
      <div className="status-card__progress">
        <LinearProgress value={data.progress} label="Task completion" />
        <strong>{data.progress}%</strong>
      </div>
      <dl className="status-card__meta">
        <div>
          <dt>Started</dt>
          <dd>{data.startedAt}</dd>
        </div>
        <div>
          <dt>Elapsed</dt>
          <dd>{data.elapsed}</dd>
        </div>
        <div>
          <dt>Est. finish</dt>
          <dd>{data.estimatedFinish}</dd>
        </div>
      </dl>
    </SurfaceCard>
  )
}
