import type { ReactNode } from 'react'
import type { TaskStatus } from '../../types/dashboard'

type StatusPillProps = {
  status?: TaskStatus | 'active' | 'idle' | 'done' | 'current' | 'todo'
  children: ReactNode
  className?: string
}

export function StatusPill({ status = 'active', children, className = '' }: StatusPillProps) {
  return (
    <span className={`status-pill status-pill--${status} ${className}`.trim()}>
      <span className="status-pill__dot" aria-hidden="true" />
      {children}
    </span>
  )
}
