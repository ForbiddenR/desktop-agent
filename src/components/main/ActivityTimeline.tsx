import { TimelineEntry } from './TimelineEntry'
import type { TimelineItem } from '../../types/dashboard'

type ActivityTimelineProps = {
  items: TimelineItem[]
  onOpenArtifact: (artifactId: string) => Promise<void>
}

export function ActivityTimeline({ items, onOpenArtifact }: ActivityTimelineProps) {
  return (
    <section className="timeline" aria-label="Agent activity timeline">
      {items.map(item => (
        <TimelineEntry item={item} key={item.id} onOpenArtifact={onOpenArtifact} />
      ))}
    </section>
  )
}
