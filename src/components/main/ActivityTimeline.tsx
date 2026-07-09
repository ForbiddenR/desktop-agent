import { TimelineEntry } from './TimelineEntry'
import type { TimelineItem } from '../../types/dashboard'

type ActivityTimelineProps = {
  items: TimelineItem[]
}

export function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <section className="timeline" aria-label="Agent activity timeline">
      {items.map(item => (
        <TimelineEntry item={item} key={item.id} />
      ))}
    </section>
  )
}
