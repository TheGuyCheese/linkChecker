import { useNavigate } from 'react-router-dom'
import { useCheck } from '../context/CheckContext.jsx'
import InputCard from '../components/InputCard.jsx'
import SettingsRow from '../components/SettingsRow.jsx'

export default function InputPage() {
  const navigate = useNavigate()
  const { settings, setSettings, startCheck, clearResults } = useCheck()

  function handleRun(urls) {
    clearResults()
    startCheck(urls)          // fire-and-forget — streams into context
    navigate('/results')      // immediately switch screen
  }

  return (
    <div className="page-enter flex-grow flex flex-col items-center pt-16 pb-xl px-md md:px-lg gap-lg w-full">
      {/* Hero */}
      <div className="w-full max-w-[860px] text-center mb-4">
        <h1 className="text-headline-lg font-semibold text-on-surface mb-sm">
          Check if your links are alive
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Paste URLs or drop a .txt file — get instant results
        </p>
      </div>

      {/* Input card */}
      <InputCard onRun={handleRun} isChecking={false} />

      {/* Inline settings */}
      <SettingsRow
        timeout={settings.timeout}
        workers={settings.workers}
        onTimeoutChange={v => setSettings({ timeout: v })}
        onWorkersChange={v => setSettings({ workers: v })}
      />
    </div>
  )
}
