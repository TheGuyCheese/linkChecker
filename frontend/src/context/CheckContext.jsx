import { createContext, useContext, useReducer, useRef, useCallback } from 'react'

// In dev, Vite proxies /api → localhost:3001 so API_BASE stays empty.
// In production, set VITE_API_URL to your backend's public URL, e.g.:
//   VITE_API_URL=https://your-backend.up.railway.app
const API_BASE = import.meta.env.VITE_API_URL || ''

const CheckContext = createContext(null)

const initialState = {
  results: [],
  isChecking: false,
  progress: { completed: 0, total: 0 },
  settings: { timeout: 8, workers: 10 },
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    case 'START_CHECK':
      return {
        ...state,
        isChecking: true,
        results: [],
        progress: { completed: 0, total: action.total },
      }

    case 'ADD_RESULT':
      return {
        ...state,
        results: [...state.results, action.result],
        progress: { ...state.progress, completed: state.progress.completed + 1 },
      }

    case 'UPDATE_RESULT': {
      const idx = state.results.findIndex(r => r.url === action.result.url)
      if (idx === -1) return state
      const next = [...state.results]
      next[idx] = action.result
      return { ...state, results: next }
    }

    case 'STOP_CHECK':
      return { ...state, isChecking: false }

    case 'CLEAR':
      return { ...initialState, settings: state.settings }

    default:
      return state
  }
}

export function CheckProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const abortRef = useRef(null)
  // Keep a live ref to settings so callbacks don't go stale
  const settingsRef = useRef(state.settings)
  settingsRef.current = state.settings

  const startCheck = useCallback(async (urls) => {
    const { timeout, workers } = settingsRef.current
    dispatch({ type: 'START_CHECK', total: urls.length })

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`${API_BASE}/api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, timeout, workers }),
        signal: controller.signal,
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            dispatch({ type: 'ADD_RESULT', result: JSON.parse(line) })
          } catch { /* ignore malformed line */ }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Check error:', err)
    } finally {
      dispatch({ type: 'STOP_CHECK' })
    }
  }, [])

  const stopCheck = useCallback(() => {
    abortRef.current?.abort()
    dispatch({ type: 'STOP_CHECK' })
  }, [])

  const recheckUrl = useCallback(async (url) => {
    const { timeout } = settingsRef.current
    try {
      const res = await fetch(`${API_BASE}/api/check-single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, timeout }),
      })
      const result = await res.json()
      dispatch({ type: 'UPDATE_RESULT', result })
    } catch (err) {
      console.error('Recheck error:', err)
    }
  }, [])

  const setSettings = useCallback((payload) => {
    dispatch({ type: 'SET_SETTINGS', payload })
  }, [])

  const clearResults = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  return (
    <CheckContext.Provider
      value={{ ...state, startCheck, stopCheck, recheckUrl, setSettings, clearResults }}
    >
      {children}
    </CheckContext.Provider>
  )
}

export function useCheck() {
  const ctx = useContext(CheckContext)
  if (!ctx) throw new Error('useCheck must be used inside <CheckProvider>')
  return ctx
}
