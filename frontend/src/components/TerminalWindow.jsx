export default function TerminalWindow({ title = 'zsh', children, className = '' }) {
  return (
    <div className={`rounded-lg border border-border bg-panel shadow-[0_0_0_1px_rgba(255,255,255,0.02)] overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-panel2 border-b border-border">
        <span className="w-3 h-3 rounded-full bg-danger/80" />
        <span className="w-3 h-3 rounded-full bg-amber/80" />
        <span className="w-3 h-3 rounded-full bg-accent/80" />
        <span className="ml-3 text-xs text-muted font-mono tracking-wide">{title}</span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  )
}
