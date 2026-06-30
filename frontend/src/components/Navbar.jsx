import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  const linkClass = (path) =>
    `font-mono text-sm px-3 py-1.5 rounded-md transition-colors ${
      pathname === path
        ? 'bg-accent/10 text-accent border border-accent/30'
        : 'text-muted hover:text-ink border border-transparent'
    }`

  return (
    <header className="border-b border-border bg-canvas/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-accent font-mono text-lg">🔍</span>
          <span className="font-mono text-ink font-medium tracking-tight group-hover:text-accent transition-colors">
            Github-analyzer
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/" className={linkClass('/')}>🔍 Analyze</Link>
          <Link to="/profiles" className={linkClass('/profiles')}>history</Link>
        </nav>
      </div>
    </header>
  )
}
