import ResultRow from './ResultRow.jsx'

export default function ResultsList({ results, filter, onRecheck }) {
  const displayed = results.filter(r => {
    if (filter === 'Online')  return r.exists
    if (filter === 'Offline') return !r.exists
    return true
  })

  if (displayed.length === 0) {
    return (
      <div className="w-full max-w-[860px] text-center py-8 text-on-surface-variant text-body-md">
        No results match this filter.
      </div>
    )
  }

  return (
    <div className="w-full max-w-[860px] flex flex-col gap-sm">
      {displayed.map(r => (
        <ResultRow key={r.url} result={r} onRecheck={onRecheck} />
      ))}
    </div>
  )
}
