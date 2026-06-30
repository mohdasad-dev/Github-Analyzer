import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TerminalWindow from '../components/TerminalWindow.jsx'
import StatCard from '../components/StatCard.jsx'
import Loader from '../components/Loader.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import { getProfile } from '../api.js'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function accountAgeYears(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  const years = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return years
}

export default function ProfileDetail() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getProfile(username)
      .then((data) => {
        if (active) setProfile(data)
      })
      .catch((err) => {
        if (active) setError(err.message || 'profile not found')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [username])

  const ratio =
    profile && profile.following ? (profile.followers / profile.following).toFixed(2) : null
  const ageYears = profile ? accountAgeYears(profile.account_created_at) : null

  const repos = profile?.repositories || []
  const totalStars = repos.reduce((sum, r) => sum + (r.stars || 0), 0)
  const totalForks = repos.reduce((sum, r) => sum + (r.forks || 0), 0)
  const topRepos = [...repos].sort((a, b) => (b.stars || 0) - (a.stars || 0)).slice(0, 5)

  const languages = Array.isArray(profile?.public_repo_languages) ? profile.public_repo_languages : []

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/profiles" className="text-xs font-mono text-muted hover:text-accent transition-colors">
        ← back to log
      </Link>

      <div className="mt-4">
        {loading && <Loader label={`checking out ${username}`} />}
        <ErrorBanner message={error} />

        {profile && !loading && !error && (
          <div className="space-y-6">
            <TerminalWindow title={`${profile.username}.profile`} className="animate-fadeUp">
              <div className="flex items-start gap-4 mb-6">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.username} avatar`}
                    className="w-16 h-16 rounded-full border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-panel2 border border-border flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <h1 className="font-mono text-xl text-ink font-semibold truncate">
                    {profile.username}
                    {profile.name && <span className="text-muted font-sans text-base"> · {profile.name}</span>}
                  </h1>
                  {profile.bio && <p className="text-sm text-muted mt-1">{profile.bio}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs font-mono text-muted">
                    {profile.location && <span>📍 {profile.location}</span>}
                    {profile.company && <span>🏢 {profile.company}</span>}
                    <span>joined {formatDate(profile.account_created_at)}</span>
                  </div>
                  {profile.profile_url && (
                    <a
                      href={profile.profile_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-accent hover:underline mt-2 inline-block"
                    >
                      view on github →
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <StatCard label="repos" value={profile.public_repos ?? '—'} />
                <StatCard label="followers" value={profile.followers ?? '—'} accent="accent2" />
                <StatCard label="following" value={profile.following ?? '—'} />
                <StatCard label="total stars" value={totalStars} />
                <StatCard label="total forks" value={totalForks} />
                <StatCard label="gists" value={profile.total_gists ?? '—'} />
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-[11px] uppercase tracking-wider text-muted font-mono mb-3">
                  derived insights
                </p>
                <ul className="space-y-1.5 text-sm font-mono text-ink">
                  <li>
                    <span className="text-muted">follower / following ratio:</span>{' '}
                    {ratio !== null ? ratio : 'n/a'}
                  </li>
                  <li>
                    <span className="text-muted">account age:</span>{' '}
                    {ageYears !== null ? `${ageYears.toFixed(1)} years` : 'n/a'}
                  </li>
                  <li>
                    <span className="text-muted">analysis status:</span>{' '}
                    {profile.analysis_status || 'n/a'}
                  </li>
                  <li>
                    <span className="text-muted">last analyzed:</span>{' '}
                    {formatDate(profile.last_analyzed_at)}
                  </li>
                </ul>
              </div>
            </TerminalWindow>

            {languages.length > 0 && (
              <TerminalWindow title="languages.json" className="animate-fadeUp">
                <ul className="space-y-2">
                  {languages.slice(0, 8).map((lang) => (
                    <li key={lang.language} className="flex items-center gap-3 text-sm font-mono">
                      <span className="w-28 text-ink truncate">{lang.language}</span>
                      <div className="flex-1 h-2 rounded-full bg-panel2 overflow-hidden">
                        <div
                          className="h-full bg-accent2"
                          style={{ width: `${lang.percentage}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-muted">{lang.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </TerminalWindow>
            )}

            {topRepos.length > 0 && (
              <TerminalWindow title="top-repos --sort=stars" className="animate-fadeUp">
                <ul className="space-y-3">
                  {topRepos.map((repo) => (
                    <li key={repo.repo_full_name || repo.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <a
                          href={repo.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-sm text-accent hover:underline truncate"
                        >
                          {repo.repo_name}
                        </a>
                        <div className="flex items-center gap-3 text-xs font-mono text-muted flex-shrink-0">
                          <span>★ {repo.stars}</span>
                          <span>⑂ {repo.forks}</span>
                        </div>
                      </div>
                      {repo.description && (
                        <p className="text-xs text-muted mt-1 truncate">{repo.description}</p>
                      )}
                      {repo.language && (
                        <span className="text-[11px] font-mono text-muted/80 mt-1 inline-block">
                          {repo.language}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </TerminalWindow>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
