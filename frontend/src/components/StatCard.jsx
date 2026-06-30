export default function StatCard({ label, value, accent = 'accent' }) {
  const colorClass = accent === 'accent' ? 'text-accent' : accent === 'accent2' ? 'text-accent2' : 'text-ink'
  return (
    <div className="rounded-md border border-border bg-panel2 px-4 py-3 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-muted font-mono">{label}</span>
      <span className={`text-2xl font-mono font-semibold ${colorClass}`}>{value}</span>
    </div>
  )
}
