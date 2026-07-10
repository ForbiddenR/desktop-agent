import {
  Check,
  ChevronRight,
  Circle,
  Code2,
  FileJson,
  PackageOpen,
  Search,
  Sparkles,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { IconBadge } from '../ui/IconBadge'
import type { StepItem, TimelineItem } from '../../types/dashboard'

const toolIcons = {
  summary: Sparkles,
  tool: Search,
  code: Code2,
  artifact: PackageOpen,
}

function StepMark({ step }: { step: StepItem }) {
  if (step.state === 'done') {
    return (
      <span className="step-mark step-mark--done" aria-hidden="true">
        <Check size={13} />
      </span>
    )
  }

  if (step.state === 'current') {
    return <span className="step-mark step-mark--current" aria-hidden="true" />
  }

  return (
    <span className="step-mark step-mark--todo" aria-hidden="true">
      <Circle size={12} />
    </span>
  )
}

function TimelineScaffold({
  children,
  item,
}: {
  children: ReactNode
  item: TimelineItem
}) {
  const Icon = toolIcons[item.kind]
  const accent = item.kind === 'summary' ? 'purple' : item.accent
  const label = item.kind === 'summary' ? item.actor : item.tool

  return (
    <article className={`timeline-entry timeline-entry--${item.kind}`}>
      <IconBadge accent={accent} className="timeline-entry__badge">
        <Icon size={18} />
      </IconBadge>
      <div className="timeline-entry__body">
        <div className="timeline-entry__heading">
          <strong>{label}</strong>
          <span>{item.time}</span>
        </div>
        {children}
      </div>
    </article>
  )
}

export function TimelineEntry({
  item,
  onOpenArtifact,
}: {
  item: TimelineItem
  onOpenArtifact: (artifactId: string) => Promise<void>
}) {
  if (item.kind === 'summary') {
    return (
      <TimelineScaffold item={item}>
        <p className="timeline-entry__text">{item.text}</p>
        <ul className="mini-checklist" aria-label="Task checklist">
          {item.checklist.map(step => (
            <li className={`mini-checklist__item is-${step.state}`} key={step.id}>
              <StepMark step={step} />
              <span>{step.label}</span>
            </li>
          ))}
        </ul>
      </TimelineScaffold>
    )
  }

  if (item.kind === 'tool') {
    return (
      <TimelineScaffold item={item}>
        <div className="timeline-entry__row">
          <p className="timeline-entry__text">{item.text}</p>
          {item.meta ? (
            <button className="result-chip" type="button">
              <span>{item.meta}</span>
              <ChevronRight size={14} />
            </button>
          ) : null}
        </div>
      </TimelineScaffold>
    )
  }

  if (item.kind === 'code') {
    return (
      <TimelineScaffold item={item}>
        <p className="timeline-entry__text">
          Creating file <strong>{item.file}</strong>
        </p>
        <div className="code-preview" aria-label={`${item.file} code preview`}>
          {item.lines.map((line, index) => (
            <div className="code-preview__line" key={`${line}-${index}`}>
              <span className="code-preview__number">{index + 1}</span>
              <code>{line || ' '}</code>
            </div>
          ))}
        </div>
      </TimelineScaffold>
    )
  }

  return (
    <TimelineScaffold item={item}>
      <div className="timeline-entry__row">
        <p className="timeline-entry__text">{item.text}</p>
        <button
          className="artifact-chip"
          type="button"
          disabled={!item.artifactPath}
          onClick={() => void onOpenArtifact(item.id).catch(() => undefined)}
        >
          <FileJson size={14} />
          <span>{item.artifactLabel}</span>
          <span className="artifact-chip__sync" aria-hidden="true" />
          <Check size={14} />
        </button>
      </div>
    </TimelineScaffold>
  )
}
