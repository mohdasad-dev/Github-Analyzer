const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

async function handle(res) {
  let body = null
  try {
    body = await res.json()
  } catch {
    // no JSON body
  }

  if (!res.ok || (body && body.success === false)) {
    const message = (body && (body.error || body.message)) || `Request failed (${res.status})`
    throw new Error(message)
  }

  return body
}

export async function analyzeProfile(username) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  })
  const body = await handle(res)
  return body.data // { profile, metrics, top_languages, repositories_count }
}

export async function getProfiles(page = 1, limit = 20) {
  const res = await fetch(`${BASE_URL}/profiles?page=${page}&limit=${limit}`)
  const body = await handle(res)
  return body.data // { profiles, pagination }
}

export async function getProfile(username) {
  const res = await fetch(`${BASE_URL}/profile/${encodeURIComponent(username)}`)
  const body = await handle(res)
  return body.data // profile row + repositories[] + analysisHistory[] + public_repo_languages
}
