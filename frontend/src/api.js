// Thin client for the ThinkElse FastAPI backend.
// The backend is mounted under root_path="/api/v1", so all routes live there.

const BASE = '/api/v1'

async function request(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    // FastAPI HTTPException detail: string | { message, error[] }
    const error = new Error(
      typeof body?.detail === 'string'
        ? body.detail
        : body?.detail?.message || `Request failed (${response.status})`
    )
    error.status = response.status
    error.detail = body?.detail ?? null
    throw error
  }

  return body
}

export function fetchHealth() {
  return request('/health')
}

export function validateWord(word, previousWords = []) {
  return request('/validate-word', {
    method: 'POST',
    body: JSON.stringify({ word, previous_words: previousWords }),
  })
}

export function scoreSubmission(words) {
  return request('/score', {
    method: 'POST',
    body: JSON.stringify({ words }),
  })
}
