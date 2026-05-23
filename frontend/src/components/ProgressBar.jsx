export default function ProgressBar({ completed, total, minimal = false }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  if (minimal) {
    return (
      <div className="w-full h-0.5 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-container rounded-full transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[860px]">
      <div className="flex justify-between items-center mb-1">
        <span className="font-label-sm text-label-sm text-on-surface-variant progress-pulse">
          Checking {completed}/{total}
        </span>
        <span className="font-label-sm text-label-sm text-primary">{pct}%</span>
      </div>
      <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-container rounded-full transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
