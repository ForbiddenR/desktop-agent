import { ContextCard } from '../cards/ContextCard'
import { StatusCard } from '../cards/StatusCard'
import { StepsCard } from '../cards/StepsCard'
import { ToolsCard } from '../cards/ToolsCard'
import type { DashboardData } from '../../types/dashboard'

type RightRailProps = {
  data: DashboardData
}

export function RightRail({ data }: RightRailProps) {
  return (
    <aside className="right-rail" aria-label="Task status details">
      <StatusCard data={data} />
      <ToolsCard tools={data.tools} />
      <ContextCard items={data.contextItems} />
      <StepsCard steps={data.steps} />
    </aside>
  )
}
