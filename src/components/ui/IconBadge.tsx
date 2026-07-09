import type { ReactNode } from 'react'
import type { AccentColor } from '../../types/dashboard'

type IconBadgeProps = {
  accent?: AccentColor
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
}

export function IconBadge({
  accent = 'purple',
  size = 'md',
  children,
  className = '',
}: IconBadgeProps) {
  return (
    <span
      className={`icon-badge icon-badge--${accent} icon-badge--${size} ${className}`.trim()}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}
