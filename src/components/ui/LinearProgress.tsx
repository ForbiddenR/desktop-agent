type LinearProgressProps = {
  value: number
  label?: string
  className?: string
}

export function LinearProgress({ value, label, className = '' }: LinearProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      className={`linear-progress ${className}`.trim()}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
      aria-label={label}
    >
      <span className="linear-progress__track">
        <span
          className="linear-progress__bar"
          style={{ width: `${clampedValue}%` }}
        />
      </span>
    </div>
  )
}
