export default function Loader({ label = 'fetching' }) {
  return (
    <div className="flex items-center gap-2 font-mono text-sm text-muted py-2">
      <span className="text-accent">$</span>
      <span>{label}</span>
      <span className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:300ms]" />
      </span>
    </div>
  )
}
