import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCheck } from '../context/CheckContext.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import FilterRow from '../components/FilterRow.jsx'
import VirtualResultsList from '../components/VirtualResultsList.jsx'
import StatsCharts from '../components/StatsCharts.jsx'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { results, isChecking, progress, stopCheck, recheckUrl } = useCheck()
  const [filter, setFilter] = useState('All')

  const online  = results.filter(r => r.exists).length
  const offline = results.filter(r => !r.exists).length

  function downloadCSV() {
    const header = 'URL,Status,HTTP Code,Response Time (ms),Final URL\n'
    const rows = results
      .map(r =>
        [
          `"${r.url}"`,
          r.exists ? 'UP' : 'DOWN',
          r.status ?? '',
          r.responseTime ?? '',
          `"${r.finalUrl ?? ''}"`,
        ].join(',')
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'link_check_results.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function handleBack() {
    if (isChecking) stopCheck()
    navigate('/')
  }

  const displayed = results.filter(r => {
    if (filter === 'Online')  return r.exists
    if (filter === 'Offline') return !r.exists
    return true
  })

  return (
    <div className="page-enter flex-grow flex flex-col w-full">

      {/* ── Sticky results toolbar ─────────────────────────────────────── */}
      <div className="sticky top-[57px] z-40 bg-surface border-b border-outline-variant w-full">
        <div className="flex items-center justify-between px-lg py-sm max-w-container-max mx-auto gap-md">

          {/* Left: back + status */}
          <div className="flex items-center gap-md">
            <button
              onClick={handleBack}
              className="flex items-center gap-xs text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
            <span className="text-outline-variant select-none">|</span>
            {isChecking ? (
              <span className="font-label-sm text-label-sm text-on-surface-variant progress-pulse">
                Checking… {progress.completed}/{progress.total}
              </span>
            ) : results.length > 0 ? (
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {results.length} URLs checked · {online} online · {offline} offline
              </span>
            ) : null}
          </div>

          {/* Right: stop + download */}
          <div className="flex items-center gap-sm">
            {isChecking && (
              <button
                onClick={stopCheck}
                className="flex items-center gap-xs px-md py-xs rounded-lg border border-app-red text-app-red hover:bg-app-red-bg transition-all font-label-sm text-label-sm"
              >
                <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                Stop
              </button>
            )}
            {results.length > 0 && (
              <button
                onClick={downloadCSV}
                className="flex items-center gap-xs px-md py-xs rounded-lg border border-app-border text-app-green hover:bg-[rgba(62,207,142,0.05)] hover:border-app-green transition-all font-label-sm text-label-sm"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                CSV
              </button>
            )}
          </div>
        </div>

        {/* Progress bar sits flush at the bottom of the toolbar */}
        {isChecking && (
          <div className="px-lg pb-sm max-w-container-max mx-auto">
            <ProgressBar completed={progress.completed} total={progress.total} minimal />
          </div>
        )}
      </div>

      {/* ── Page body ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center px-md md:px-lg pb-xl gap-lg w-full pt-8">

        {/* Charts — only show once we have some data */}
        {results.length > 0 && <StatsCharts results={results} />}

        {/* Empty state while first results load */}
        {results.length === 0 && isChecking && (
          <div className="w-full max-w-[860px] flex flex-col items-center justify-center py-20 gap-4">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant animate-spin">
              progress_activity
            </span>
            <p className="text-body-lg text-on-surface-variant">Loading first results…</p>
          </div>
        )}

        {/* Filter + list */}
        {results.length > 0 && (
          <>
            <div className="w-full max-w-[860px]">
              <div className="flex items-center justify-between mb-3">
                <FilterRow active={filter} onChange={setFilter} />
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {displayed.length} shown
                </span>
              </div>
              <VirtualResultsList results={displayed} onRecheck={recheckUrl} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
