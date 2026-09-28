import type { Plugin, Connect } from 'vite'
import type { ServerResponse } from 'node:http'

const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-flash-latest']

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  let lastError: unknown = null

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.6,
              maxOutputTokens: 700,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
        },
      )

      if (!response.ok) {
        const errText = await response.text()
        lastError = new Error(`Gemini ${model} error ${response.status}: ${errText}`)
        continue
      }

      const json: any = await response.json()
      const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? ''
      if (text.trim()) return text.trim()
      lastError = new Error(`Gemini ${model} returned empty response`)
    } catch (err) {
      lastError = err
    }
  }

  throw lastError ?? new Error('Gemini request failed')
}

const BUSINESS_SYSTEM_PROMPT = `Siz "AI Retail Copilot" nomli elektronika do'konlar tarmog'i uchun ishlaydigan sun'iy intellekt yordamchisiz.
Sizga savol va shu savolga tizim tomonidan allaqachon hisoblab chiqilgan aniq javob (factsSummary) hamda qo'shimcha tafsilotlar (details) JSON ko'rinishida beriladi.
Vazifangiz: shu faktlarni o'zgartirmasdan, yangi raqam yoki ma'lumot to'qib chiqarmasdan, ularni tabiiy, qisqa (2-4 gap) va professional CEO/sotuvchi uslubida o'zbek tilida qayta ifodalash.
Barcha raqamlar va nomlarni factsSummary va details ichida berilganidek aniq saqlang.
Javobni oddiy matn ko'rinishida yozing — markdown belgilaridan (**, *, #, - kabi) foydalanmang.
Faqat tayyor javobning o'zini qaytaring — "Mana javob:", "Albatta:" kabi kirish so'zlari yoki izohlar yozmang.`

export function geminiApiPlugin(apiKey: string | undefined): Plugin {
  return {
    name: 'gemini-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/ai/ask', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
        if (!apiKey) return sendJson(res, 500, { error: 'GEMINI_API_KEY is not configured on the server' })

        try {
          const raw = await readBody(req)
          const { question, context } = JSON.parse(raw || '{}')
          if (!question) return sendJson(res, 400, { error: 'question is required' })

          const prompt = `${BUSINESS_SYSTEM_PROMPT}\n\nBiznes ma'lumotlari (JSON):\n${JSON.stringify(context)}\n\nSavol: ${question}\n\nJavob:`
          const text = await callGemini(apiKey, prompt)
          sendJson(res, 200, { text })
        } catch (err) {
          sendJson(res, 502, { error: err instanceof Error ? err.message : 'Gemini request failed' })
        }
      })

      server.middlewares.use('/api/ai/pitch', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' })
        if (!apiKey) return sendJson(res, 500, { error: 'GEMINI_API_KEY is not configured on the server' })

        try {
          const raw = await readBody(req)
          const { customerRequest, product, reasons } = JSON.parse(raw || '{}')
          if (!product) return sendJson(res, 400, { error: 'product is required' })

          const prompt = `Siz elektronika do'konida ishlaydigan tajribali sotuvchi AI yordamchisisiz.
Mijozning talabi: "${customerRequest ?? ''}"
Tavsiya etilgan mahsulot ma'lumotlari (JSON, faqat shu ma'lumotlardan foydalaning, boshqa xususiyat to'qib chiqarmang):
${JSON.stringify(product)}
Mos kelish sabablari: ${JSON.stringify(reasons ?? [])}

Shu ma'lumotlar asosida mijozga o'zbek tilida qisqa (2-3 gap), ishonarli va samimiy savdo taklifi (pitch) yozing. Narx va texnik xususiyatlarni aynan berilganidek keltiring (narx allaqachon formatlangan, uni o'zgartirmang).
Javobni oddiy matn ko'rinishida yozing — markdown belgilaridan (**, *, #, - kabi) foydalanmang.
Faqat tayyor taklifning o'zini qaytaring — "Mana taklif:", "Albatta:" kabi kirish so'zlari yoki izohlar yozmang.`

          const text = await callGemini(apiKey, prompt)
          sendJson(res, 200, { text })
        } catch (err) {
          sendJson(res, 502, { error: err instanceof Error ? err.message : 'Gemini request failed' })
        }
      })
    },
  }
}
