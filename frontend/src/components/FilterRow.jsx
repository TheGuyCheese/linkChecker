const FILTERS = ['All', 'Online', 'Offline']

export default function FilterRow({ active, onChange }) {
  return (
    <div className="w-full max-w-[860px] flex gap-sm">
      {FILTERS.map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`font-label-sm text-label-sm px-md py-xs rounded-full border transition-colors ${
            active === f
              ? 'bg-primary-container text-on-primary-container border-primary-container'
              : 'bg-transparent text-outline hover:text-on-surface border-app-border hover:border-outline'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
