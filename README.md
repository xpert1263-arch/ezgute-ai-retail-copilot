# AI Retail Copilot

A hackathon project: an AI-powered management and sales-assistant dashboard for electronics retail chains. The UI is in Uzbek; it combines a deterministic, locally-computed business analytics engine with real Gemini AI for natural-language understanding and generation.

## Overview

AI Retail Copilot gives a retail chain (branches, products, sales) a single dashboard with:

- A live business analytics view (revenue, sales, branch performance, category mix).
- A conversational sales assistant that matches customer requests to products.
- A conversational CEO assistant that answers business questions with grounded facts and charts.
- A searchable/filterable product catalog with per-branch stock detail.

All numbers shown anywhere in the app come from one shared dataset (`src/data/products.ts` + `src/data/analytics.ts`), so the dashboard, Seller AI, CEO AI, and product catalog never contradict each other.

## Features

### AI Retail Dashboard (Bosh sahifa)
- Today's revenue, sales count, average order value, and active customers.
- Weekly revenue trend chart and per-branch performance bars.
- Dynamically generated insights (top product, low-stock warnings, best/worst branch) — computed from the live data, not hardcoded.
- A central AI command bar for free-form business questions.

### Seller AI / Sotuvchi AI
- Parses a free-text customer request (budget, camera/battery preference, brand, storage) in Uzbek.
- Scores the product catalog and returns the top 3 matches with a match percentage and a "Nega mos?" (why it matches) explanation.
- Side-by-side comparison of 2–3 selected products (price, storage, camera, battery, display, chip, stock).
- Generates a short, Gemini-written sales pitch grounded in the actual product data and real branch stock.

### CEO AI
- Conversational chat interface with session history.
- Understands intents such as today's revenue, top-selling product, best/worst branch, low stock, category performance, reorder candidates, and slow-moving products.
- Answers combine a locally-computed factual summary with a natural-language rephrasing from Gemini, plus structured KPI/chart/branch-comparison blocks.

### Product Management (Mahsulotlar)
- Full catalog table with search and filters (brand, category, branch, stock status, price range).
- Click-through detail drawer showing specs, per-branch stock, and sales, with a low-stock warning where relevant.

### Gemini AI Integration
- The local analytics/intent engine (`src/services/localAI.ts`, `src/services/sellerCopilot.ts`) always computes the facts first — numbers are never invented by the AI.
- Gemini is used only to rephrase those already-correct facts into natural Uzbek text (CEO AI, Home command bar) and to write sales pitches (Seller AI).
- **The Gemini API key is used server-side only.** It is read from `GEMINI_API_KEY` inside a custom Vite dev-server middleware (`vite-plugins/gemini-api.ts`) and is never bundled into client-side JavaScript.
- If the Gemini call fails or times out for any reason, the UI falls back to the local deterministic answer automatically — the app never breaks if the API is unavailable.

## Tech Stack

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 8
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Framer Motion](https://motion.dev/)
- [Recharts](https://recharts.org/)
- [Lucide](https://lucide.dev/) (icons)
- [Google Gemini API](https://ai.google.dev/) (called via REST `generateContent`, server-side)

## Installation

```bash
git clone https://github.com/xpert1263-arch/ezgute-ai-retail-copilot.git
cd ezgute-ai-retail-copilot
npm install
```

## Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Then open `.env` and set your own key:

```
GEMINI_API_KEY=YOUR_KEY
```

Get a key from [Google AI Studio](https://aistudio.google.com/). The key is only ever read on the server side (inside the Vite dev server process) — never commit `.env` or paste your real key into `.env.example`.

## Development

```bash
npm run dev
```

Starts the Vite dev server (including the Gemini API middleware) at `http://localhost:5173`.

## Production Build

```bash
npm run build
```

Type-checks the project (`tsc -b`) and builds a production bundle with Vite into `dist/`.

> Note: the Gemini middleware currently runs inside the Vite **dev** server only. A static production deployment of `dist/` would need its own backend/serverless endpoint to keep the API key off the client — this hasn't been built yet since the project currently targets local/dev demo use.
