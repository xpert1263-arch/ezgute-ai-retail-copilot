const REQUEST_TIMEOUT_MS = 15_000

/** Strips stray markdown emphasis/heading/bullet markers in case the model doesn't follow the plain-text instruction. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .trim()
}

async function postJson(url: string, body: unknown): Promise<string | null> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!res.ok) return null

    const data = await res.json()
    return typeof data.text === 'string' ? stripMarkdown(data.text) : null
  } catch {
    return null
  } finally {
    window.clearTimeout(timeout)
  }
}

/** Asks Gemini to phrase a natural-language answer grounded in the given business context. Returns null on any failure so callers can fall back to the local deterministic summary. */
export async function askBusinessAI(question: string, context: unknown): Promise<string | null> {
  return postJson('/api/ai/ask', { question, context })
}

/** Asks Gemini to write a short sales pitch grounded in the given product data. Returns null on failure. */
export async function generateAiPitch(payload: {
  customerRequest: string
  product: unknown
  reasons: string[]
}): Promise<string | null> {
  return postJson('/api/ai/pitch', payload)
}
