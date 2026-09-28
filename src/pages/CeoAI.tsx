import { useState } from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit, Send, User } from 'lucide-react'
import { ResponseBlocks } from '../components/ai/ResponseBlocks'
import { getAIResponse, type AIResponse } from '../services/localAI'
import { askBusinessAI } from '../services/geminiClient'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text?: string
  response?: AIResponse
}

const EXAMPLE_PROMPTS = [
  "Bugun eng ko'p nima sotildi?",
  'Qaysi filial yaxshi ishlayapti?',
  'Shofirkonda vaziyat qanday?',
  'Qaysi mahsulotlar kam qolgan?',
  "Qaysi kategoriya ko'p daromad keltiryapti?",
  "Bugun nimaga e'tibor berishim kerak?",
]

let idCounter = 0
function nextId() {
  idCounter += 1
  return `m-${idCounter}`
}

export function CeoAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend(text?: string) {
    const question = text ?? query
    if (!question.trim() || loading) return

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: question }])
    setQuery('')
    setLoading(true)

    await new Promise((resolve) => window.setTimeout(resolve, 600))
    const response = getAIResponse(question)
    const assistantId = nextId()
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', response }])
    setLoading(false)

    const aiText = await askBusinessAI(question, { factsSummary: response.summary, details: response.blocks })
    if (aiText) {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId && m.response ? { ...m, response: { ...m.response, summary: aiText } } : m)),
      )
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">CEO AI</h1>
        <p className="mt-1 text-sm text-text-muted">Biznesingiz haqida chuqur tahlil va tavsiyalar</p>
      </div>

      <div className="mt-5 flex-1 overflow-y-auto rounded-xl border border-base-border bg-base-panel p-5">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-blue/15">
              <BrainCircuit className="h-5 w-5 text-accent-blue" size={20} />
            </div>
            <p className="mt-3 text-sm font-medium text-text-primary">Biznesingiz haqida savol bering</p>
            <p className="mt-1 text-xs text-text-muted">Masalan, quyidagilardan birini sinab ko'ring</p>
            <div className="mt-4 flex max-w-lg flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="rounded-full border border-base-border px-3 py-1.5 text-[11px] text-text-muted transition-colors hover:border-accent-blue/40 hover:text-text-primary"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  m.role === 'user' ? 'bg-white/10' : 'bg-accent-blue/15'
                }`}
              >
                {m.role === 'user' ? (
                  <User className="h-3.5 w-3.5 text-text-primary" size={14} />
                ) : (
                  <BrainCircuit className="h-3.5 w-3.5 text-accent-blue" size={14} />
                )}
              </div>
              <div className={`max-w-2xl ${m.role === 'user' ? 'text-right' : ''}`}>
                {m.role === 'user' ? (
                  <div className="inline-block rounded-xl rounded-tr-sm bg-white/[0.06] px-4 py-2.5 text-sm text-text-primary">
                    {m.text}
                  </div>
                ) : (
                  <div className="inline-block w-full rounded-xl rounded-tl-sm border border-base-border bg-base-panel-deep px-4 py-3 text-left">
                    <p className="text-sm leading-relaxed text-text-primary/90">{m.response?.summary}</p>
                    {m.response && <ResponseBlocks blocks={m.response.blocks} />}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-blue/15">
                <BrainCircuit className="h-3.5 w-3.5 text-accent-blue" size={14} />
              </div>
              <div className="flex items-center gap-1 rounded-xl border border-base-border bg-base-panel-deep px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-blue [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-blue [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-blue" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex gap-2.5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Savolingizni yozing..."
          className="w-full rounded-lg border border-base-border bg-base-panel px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/70 outline-none focus:border-accent-blue/60"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-blue px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" size={16} />
        </button>
      </div>
    </div>
  )
}
