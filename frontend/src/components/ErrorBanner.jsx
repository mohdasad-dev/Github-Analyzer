export default function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="font-mono text-sm rounded-md border border-danger/40 bg-danger/10 text-danger px-4 py-3 animate-fadeUp">
      <span className="opacity-70">error:</span> {message}
    </div>
  )
}
