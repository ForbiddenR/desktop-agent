import type { ReactNode } from 'react'

type SectionHeaderProps = {
  title: string
  meta?: ReactNode
  className?: string
}

export function SectionHeader({ title, meta, className = '' }: SectionHeaderProps) {
  return (
    <div className={`section-header ${className}`.trim()}>
      <h2>{title}</h2>
      {meta ? <div className="section-header__meta">{meta}</div> : null}
    </div>
  )
}
