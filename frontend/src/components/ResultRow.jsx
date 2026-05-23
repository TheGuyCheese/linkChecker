import { useState } from 'react'

export default function ResultRow({ result, onRecheck }) {
  const { url, exists, status, responseTime, error } = result
  const [rechecking, setRechecking] = useState(false)

  const statusLabel = status ? `${status}` : (error || 'ERR')

  async function handleRecheck() {
    setRechecking(true)
    await onRecheck(url)
    setRechecking(false)
  }

  if (exists) {
    return (
      <div className="flex items-center justify-between p-md rounded-lg border border-[rgba(62,207,142,0.3)] bg-app-green-bg group hover:border-app-green transition-colors">
        <div className="flex items-center gap-md min-w-0">
          <span className="shrink-0 bg-[rgba(62,207,142,0.15)] text-app-green border border-[rgba(62,207,142,0.3)] font-label-sm text-[10px] px-2 py-1 rounded-full uppercase">
            UP
          </span>
          <span className="font-mono text-code-md text-on-surface truncate">{url}</span>
        </div>
        <div className="flex items-center gap-md shrink-0 ml-4">
          <span className="font-mono text-[12px] text-outline whitespace-nowrap">
            {responseTime != null ? `${responseTime} ms` : '—'}
          </span>
          <span className="font-mono text-code-md text-app-green border border-app-green px-2 py-0.5 rounded text-[12px]">
            {statusLabel}
          </span>
          <button
            onClick={handleRecheck}
            disabled={rechecking}
            aria-label="Re-check this URL"
            className="text-outline hover:text-app-green transition-colors opacity-0 group-hover:opacity-100 disabled:cursor-wait"
          >
            <span className={`material-symbols-outlined text-[18px] ${rechecking ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-md rounded-lg border border-[rgba(248,113,113,0.3)] bg-app-red-bg group hover:border-app-red transition-colors">
      <div className="flex items-center gap-md min-w-0">
        <span className="shrink-0 bg-[rgba(248,113,113,0.15)] text-app-red border border-[rgba(248,113,113,0.3)] font-label-sm text-[10px] px-2 py-1 rounded-full uppercase">
          DOWN
        </span>
        <span className="font-mono text-code-md text-on-surface truncate">{url}</span>
      </div>
      <div className="flex items-center gap-md shrink-0 ml-4">
        <span className="font-mono text-[12px] text-outline whitespace-nowrap">
          {responseTime != null ? `${responseTime} ms` : '—'}
        </span>
        <span className="font-mono text-code-md text-app-red border border-app-red px-2 py-0.5 rounded text-[12px]">
          {statusLabel}
        </span>
        <button
          onClick={handleRecheck}
          disabled={rechecking}
          aria-label="Re-check this URL"
          className="text-outline hover:text-app-red transition-colors opacity-0 group-hover:opacity-100 disabled:cursor-wait"
        >
          <span className={`material-symbols-outlined text-[18px] ${rechecking ? 'animate-spin' : ''}`}>
            refresh
          </span>
        </button>
      </div>
    </div>
  )
}
