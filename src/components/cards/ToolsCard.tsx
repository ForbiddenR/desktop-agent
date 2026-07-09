import { Code2, FolderOpen, Search } from 'lucide-react'
import { IconBadge } from '../ui/IconBadge'
import { SectionHeader } from '../ui/SectionHeader'
import { SurfaceCard } from '../ui/SurfaceCard'
import type { ToolItem } from '../../types/dashboard'

const toolIcons = {
  'web-search': Search,
  'code-write': Code2,
  'file-system': FolderOpen,
}

type ToolsCardProps = {
  tools: ToolItem[]
}

export function ToolsCard({ tools }: ToolsCardProps) {
  const activeCount = tools.filter(tool => tool.state === 'active').length

  return (
    <SurfaceCard className="tools-card">
      <SectionHeader title="Tools in Use" meta={`${activeCount} active`} />
      <div className="tool-list">
        {tools.map(tool => {
          const Icon = toolIcons[tool.id as keyof typeof toolIcons] ?? Search

          return (
            <div className="tool-row" key={tool.id}>
              <IconBadge accent={tool.accent} size="sm">
                <Icon size={15} />
              </IconBadge>
              <strong>{tool.name}</strong>
              <span>{tool.detail}</span>
              <i className={`activity-dot activity-dot--${tool.accent}`} aria-hidden="true" />
            </div>
          )
        })}
      </div>
    </SurfaceCard>
  )
}
