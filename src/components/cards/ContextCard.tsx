import { File, FileText, Folder, Plus } from 'lucide-react'
import { SectionHeader } from '../ui/SectionHeader'
import { SurfaceCard } from '../ui/SurfaceCard'
import type { ContextItem } from '../../types/dashboard'

const contextIcons = {
  docs: FileText,
  folder: Folder,
  file: File,
}

const contextLabels = {
  docs: 'Docs',
  folder: 'Folder',
  file: 'File',
}

type ContextCardProps = {
  items: ContextItem[]
}

export function ContextCard({ items }: ContextCardProps) {
  return (
    <SurfaceCard className="context-card">
      <SectionHeader title="Context" meta={`${items.length} items`} />
      <div className="context-list">
        {items.map(item => {
          const Icon = contextIcons[item.kind]

          return (
            <div className="context-row" key={item.id}>
              <Icon size={16} />
              <span>{item.label}</span>
              <em>{contextLabels[item.kind]}</em>
            </div>
          )
        })}
      </div>
      <button className="add-context-button" type="button">
        <Plus size={16} />
        <span>Add context</span>
      </button>
    </SurfaceCard>
  )
}
