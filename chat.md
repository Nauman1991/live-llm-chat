# AI Chat Assistant — LLM Integration Demo

A production-ready chat interface built with **React + Vite** that connects to the **Claude API (Anthropic)** in real-time. Demonstrates a clean, responsive LLM-powered chat pattern with conversation history, error handling, typing indicators, and streaming-ready architecture.

![Chat Demo](https://img.shields.io/badge/Stack-React%20+%20Vite-blue) ![API](https://img.shields.io/badge/LLM-Claude%20API-orange) ![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5 |
| LLM API | Anthropic Claude (claude-sonnet-4-20250514) |
| Styling | Inline CSS-in-JS (zero dependencies) |
| Fonts | DM Sans (Google Fonts) |
| Deploy | Vercel |

---

## Features

- **Real-time LLM Integration** — Direct connection to Anthropic's `/v1/messages` endpoint
- **Multi-turn Conversations** — Full conversation history maintained and sent with each request
- **API Key Management** — Supports both `.env` config and runtime input (key stays client-side)
- **Typing Indicators** — Animated loading state while waiting for API response
- **Error Handling** — Graceful error display with API error message parsing
- **Auto-resize Input** — Textarea grows with content, supports Shift+Enter for newlines
- **Example Prompts** — Quick-start prompt chips for immediate interaction
- **Responsive Design** — Works on desktop and mobile
- **Zero External UI Libraries** — Pure React, no component library dependencies

---

## Run Locally

### Prerequisites

- **Node.js** >= 18
- **Anthropic API Key** — Get one at [console.anthropic.com](https://console.anthropic.com/)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/ai-chat-demo.git
cd ai-chat-demo

# 2. Install dependencies
npm install

# 3. Set up your API key (pick one method)

# Method A: Environment variable (recommended)
cp .env.example .env
# Edit .env and paste your key:
# VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Method B: Enter key in the browser UI at runtime (no .env needed)

# 4. Start dev server
npm run dev
```

The app opens at **http://localhost:3000**. That's it.

---

## Deploy to Vercel

### One-Click Deploy

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the GitHub repo
4. Add environment variable: `VITE_ANTHROPIC_API_KEY` = your key
5. Click **Deploy**

### CLI Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add VITE_ANTHROPIC_API_KEY

# Deploy to production
vercel --prod
```

Your live URL will be something like: `https://ai-chat-demo-xyz.vercel.app`

---

## Project Structure

```
ai-chat-demo/
├── index.html              # Entry HTML
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
├── vercel.json             # Vercel deployment config
├── .env.example            # API key template
├── .gitignore
└── src/
    ├── main.jsx            # React mount point
    └── App.jsx             # Chat UI + API integration (single file)
```

---

## API Integration Pattern

The core integration pattern used in this demo:

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: "You are a helpful assistant.",
    messages: conversationHistory,
  }),
});

const data = await response.json();
const reply = data.content
  .filter((block) => block.type === "text")
  .map((block) => block.text)
  .join("\n");
```

**Key decisions:**
- `anthropic-dangerous-direct-browser-access` header enables client-side API calls (for demo purposes)
- Full conversation history sent each request for multi-turn context
- Response parsed from content blocks array (supports text + tool_use blocks)

---

## Extending This Demo

This is intentionally minimal to showcase the core LLM integration pattern. Easy extensions include:

- **Streaming** — Use `stream: true` and parse SSE events for real-time token display
- **Backend Proxy** — Move API key to a serverless function (`/api/chat`) for production security
- **Markdown Rendering** — Add `react-markdown` for formatted AI responses
- **Persistent History** — Store conversations in localStorage or a database
- **Multiple Models** — Add a model selector dropdown
- **System Prompt Config** — Let users customize the AI's behavior

---

## Security Note

For production use, **never expose API keys client-side**. Instead, create a backend proxy:

```
Browser → Your API Route (/api/chat) → Anthropic API
```

This demo uses direct browser access for simplicity and demonstration purposes only.

---

## License

MIT
