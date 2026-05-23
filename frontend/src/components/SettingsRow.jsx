export default function SettingsRow({ timeout, workers, onTimeoutChange, onWorkersChange }) {
  return (
    <div className="w-full max-w-[860px] flex flex-col md:flex-row items-center gap-lg md:gap-xl px-md mt-2">
      {/* Timeout */}
      <div className="flex items-center gap-md w-full md:w-1/2">
        <span className="font-label-sm text-label-sm text-on-surface-variant w-[60px]">Timeout</span>
        <input
          type="range"
          min="3"
          max="20"
          step="1"
          value={timeout}
          onChange={e => onTimeoutChange(Number(e.target.value))}
          className="flex-grow"
        />
        <span className="font-label-sm text-label-sm text-primary border border-primary-container px-xs py-[2px] rounded bg-surface-container-high w-[42px] text-center">
          {timeout}s
        </span>
      </div>
      {/* Workers */}
      <div className="flex items-center gap-md w-full md:w-1/2">
        <span className="font-label-sm text-label-sm text-on-surface-variant w-[60px]">Workers</span>
        <input
          type="range"
          min="1"
          max="20"
          step="1"
          value={workers}
          onChange={e => onWorkersChange(Number(e.target.value))}
          className="flex-grow"
        />
        <span className="font-label-sm text-label-sm text-primary border border-primary-container px-xs py-[2px] rounded bg-surface-container-high w-[42px] text-center">
          {workers}
        </span>
      </div>
    </div>
  )
}
