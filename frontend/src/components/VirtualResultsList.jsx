import { FixedSizeList } from 'react-window'
import ResultRow from './ResultRow.jsx'

const ROW_HEIGHT = 60  // px — must match the rendered row height

export default function VirtualResultsList({ results, onRecheck }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-on-surface-variant text-body-md">
        No results match this filter.
      </div>
    )
  }

  // Cap visible area at 600px; shrinks for fewer rows
  const listHeight = Math.min(results.length * ROW_HEIGHT, 600)

  function Row({ index, style }) {
    return (
      <div style={{ ...style, paddingBottom: 6 }}>
        <ResultRow result={results[index]} onRecheck={onRecheck} />
      </div>
    )
  }

  return (
    <FixedSizeList
      height={listHeight}
      itemCount={results.length}
      itemSize={ROW_HEIGHT}
      width="100%"
      style={{ overflowX: 'hidden' }}
    >
      {Row}
    </FixedSizeList>
  )
}
