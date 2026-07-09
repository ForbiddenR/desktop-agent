import { Check, Circle } from 'lucide-react'
import { SectionHeader } from '../ui/SectionHeader'
import { SurfaceCard } from '../ui/SurfaceCard'
import type { StepItem } from '../../types/dashboard'

type StepsCardProps = {
  steps: StepItem[]
}

function StepIcon({ step }: { step: StepItem }) {
  if (step.state === 'done') {
    return (
      <span className="step-icon step-icon--done" aria-hidden="true">
        <Check size={13} />
      </span>
    )
  }

  if (step.state === 'current') {
    return <span className="step-icon step-icon--current" aria-hidden="true" />
  }

  return (
    <span className="step-icon step-icon--todo" aria-hidden="true">
      <Circle size={13} />
    </span>
  )
}

export function StepsCard({ steps }: StepsCardProps) {
  const completed = steps.filter(step => step.state === 'done').length

  return (
    <SurfaceCard className="steps-card">
      <SectionHeader title="Steps" meta={`${completed} of ${steps.length} completed`} />
      <ol className="steps-list">
        {steps.map(step => (
          <li className={`steps-list__item is-${step.state}`} key={step.id}>
            <StepIcon step={step} />
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
    </SurfaceCard>
  )
}
