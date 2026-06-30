import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import { getProfiles } from '../api.js'

export default function Profiles() {
  const [profiles, setProfiles] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getProfiles(page, 20)
      .then((data) => {
        if (!active) return
        setProfiles(data.profiles || [])
        setPagination(data.pagination || null)
      })
      .catch((err) => {
        if (active) setError(err.message || 'could not load profiles')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [page])

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-mono text-xl text-ink font-semibold">Check All Activity</h1>
        <span className="text-xs font-mono text-muted">
          {pagination ? `${pagination.total} analyzed` : ''}
        </span>
      </div>

      {loading && <Loader label="reading log" />}
      <ErrorBanner message={error} />

      {!loading && !error && profiles.length === 0 && (
        <div className="border border-dashed border-border rounded-lg px-6 py-10 text-center">
          <p className="text-muted font-mono text-sm">
            nothing here yet. run an analysis from the{' '}
            <Link to="/" className="text-accent hover:underline">
              home
            </Link>{' '}
            page.
          </p>
        </div>
      )}

      <ul className="space-y-3">
        {profiles.map((p, i) => (
          <li key={p.id || p.username || i} className="animate-fadeUp" style={{ animationDelay: `${i * 40}ms` }}>
            <Link
              to={`/profiles/${p.username}`}
              className="flex items-center gap-4 rounded-md border border-border bg-panel hover:border-accent/50 hover:bg-panel2 transition-colors px-4 py-3 group"
            >
              {p.avatar_url ? (
                <img
                  src={p.avatar_url}
                  alt={`${p.username} avatar`}
                  className="w-10 h-10 rounded-full border border-border flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-panel2 border border-border flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-ink group-hover:text-accent transition-colors truncate">
                  {p.username}
                  {p.name && <span className="text-muted font-sans"> · {p.name}</span>}
                </p>
                {p.bio && <p className="text-xs text-muted truncate">{p.bio}</p>}
              </div>

              <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted flex-shrink-0">
                <span>repos <span className="text-ink">{p.public_repos ?? '—'}</span></span>
                <span>followers <span className="text-ink">{p.followers ?? '—'}</span></span>
                <span>following <span className="text-ink">{p.following ?? '—'}</span></span>
              </div>

              <span className="text-muted group-hover:text-accent transition-colors">→</span>
            </Link>
          </li>
        ))}
      </ul>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 font-mono text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-md border border-border text-muted hover:text-ink hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← prev
          </button>
          <span className="text-muted">
            page {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages}
            className="px-3 py-1.5 rounded-md border border-border text-muted hover:text-ink hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            next →
          </button>
        </div>
      )}
    </div>
  )
}
