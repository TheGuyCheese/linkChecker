import { useState, useRef } from 'react'

export default function InputCard({ onRun, isChecking, urlCount }) {
  const [activeTab, setActiveTab] = useState('paste')
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState(null)
  const fileRef = useRef(null)

  const urls = text.split('\n').map(l => l.trim()).filter(Boolean)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setText(ev.target.result)
      setFileName(file.name)
      setActiveTab('paste')
    }
    reader.readAsText(file)
  }

  function handleRun() {
    if (urls.length > 0) onRun(urls)
  }

  function handleClear() {
    setText('')
    setFileName(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="w-full max-w-[860px] bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      {/* Tabs */}
      <div className="flex border-b border-outline-variant bg-surface">
        <button
          onClick={() => setActiveTab('paste')}
          className={`px-lg py-md text-body-md flex items-center gap-sm transition-colors duration-200 ${
            activeTab === 'paste'
              ? 'text-primary border-b-2 border-primary bg-surface-container-low'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">content_paste</span>
          Paste URLs
        </button>
        <button
          onClick={() => { setActiveTab('upload'); fileRef.current?.click() }}
          className={`px-lg py-md text-body-md flex items-center gap-sm transition-colors duration-200 ${
            activeTab === 'upload'
              ? 'text-primary border-b-2 border-primary bg-surface-container-low'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">upload_file</span>
          Upload File
          {fileName && (
            <span className="ml-1 text-[11px] text-app-green border border-app-green px-1.5 py-0.5 rounded-full">
              {fileName}
            </span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {/* Textarea */}
      <div className="p-md bg-surface-container-low">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={"https://github.com\nhttps://example.com\nhttps://api.service.io/health"}
          spellCheck={false}
          rows={7}
          className="w-full bg-surface border border-outline-variant rounded-lg p-md font-mono text-code-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 resize-none outline-none"
        />
      </div>

      {/* Action row */}
      <div className="flex justify-between items-center px-lg py-md bg-surface border-t border-outline-variant">
        <div className="flex items-center gap-md">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {urls.length} URL{urls.length !== 1 ? 's' : ''} queued
          </span>
          {text && (
            <button
              onClick={handleClear}
              className="font-label-sm text-label-sm text-outline hover:text-on-surface transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <button
          onClick={handleRun}
          disabled={urls.length === 0 || isChecking}
          className="flex items-center gap-sm bg-primary-container text-on-primary-container px-lg py-sm rounded-lg font-body-md text-body-md font-medium hover:opacity-90 active:opacity-80 transition-opacity duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isChecking ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              Checking…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Run Check
            </>
          )}
        </button>
      </div>
    </div>
  )
}
