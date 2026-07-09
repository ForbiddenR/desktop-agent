import type { HTMLAttributes, ReactNode } from 'react'

type SurfaceCardProps = HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'div' | 'aside'
  children: ReactNode
}

export function SurfaceCard({
  as: Component = 'section',
  className = '',
  children,
  ...props
}: SurfaceCardProps) {
  return (
    <Component className={`surface-card ${className}`.trim()} {...props}>
      {children}
    </Component>
  )
}
