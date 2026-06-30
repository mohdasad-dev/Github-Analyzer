import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TerminalWindow from '../components/TerminalWindow.jsx'
import Loader from '../components/Loader.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import { analyzeProfile } from '../api.js'

export default function Home() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) {
      setError('username required — try: $ analyze torvalds')
      return
    }
    setLoading(true)
    setError('')
    try {
      await analyzeProfile(trimmed)
      navigate(`/profiles/${trimmed}`)
    } catch (err) {
      setError(err.message || 'analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-8 animate-fadeUp">
        <h1 className="font-mono text-2xl sm:text-3xl font-semibold text-ink mb-2">
          GitHub Profile Analyzer
        </h1>
        <p className="text-muted text-sm sm:text-base">
        Enter a GitHub username to analyze public data, generate insights, and save the results.
        </p>
      </div>

      <TerminalWindow title="Analyze Your Github Profile">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-sm sm:text-base bg-canvas border border-border rounded-md px-4 py-3 focus-within:border-accent/60 transition-colors">
            <span className="text-accent select-none">🔍</span>
            <span className="text-muted select-none">analyze</span>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Your Github username"
              className="flex-1 bg-transparent outline-none text-ink placeholder:text-muted/50"
              disabled={loading}
            />
            <span className="w-2 h-5 bg-accent animate-blink" aria-hidden="true" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto font-mono text-sm px-5 py-2.5 rounded-md bg-accent text-canvas font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'running…' : 'run analysis'}
          </button>

          {loading && <Loader label={`querying github.com/${username.trim()}`} />}
          <ErrorBanner message={error} />
        </form>
      </TerminalWindow>

      <p className="text-xs text-muted font-mono mt-6 text-center">
        already analyzed someone? view the{' '}
        <a href="/profiles" className="text-accent hover:underline">
          full Activity
        </a>
      </p>
    </div>
  )
}
