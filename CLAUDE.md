# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Aldea AI** is a full-stack educational AI platform with multi-language support (English, Russian, Kazakh). It provides AI-powered content generation, interactive learning games, user authentication, and subscription management.

## Commands

```bash
# Frontend dev server (with HMR)
npm run dev

# Backend Express server (port 5000)
npm run server

# Run both in separate terminals during development

# Build for production
npm run build

# Lint
npm run lint

# Initialize database schema
npm run init-db

# Preview production build
npm run preview
```

## Architecture

### Deployment Model

- **Frontend:** Vercel (React/Vite, `npm run build`)
- **Backend:** Render (Python/FastAPI, `backend/`)
- **Local development:** Vite (`npm run dev`) proxies `/.netlify/functions/*` and `/api/*` to FastAPI at `localhost:8000`. The old Express server (`server/`) and Netlify Functions (`netlify/`) are legacy — the Python backend is the source of truth.

### Running locally

```bash
# Terminal 1 — Python backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
npm run dev
```

### Frontend (`src/`)

- **Routing:** React Router v7 in `App.jsx`. Protected routes use `src/components/ProtectedRoute.jsx` for role-based access (user/admin).
- **Layouts:** `src/layouts/DashboardLayout.jsx` wraps all authenticated pages.
- **Global State:** Three contexts in `src/contexts/`:
  - `AuthContext` — user session and data
  - `LanguageContext` — active language (EN/RU/KK)
  - `ThemeContext` — dark/light mode
- **Translations:** All UI strings in `src/translations/` (single large file). Access via `useTranslations()` hook.
- **AI Utilities:** Content generation logic lives in `src/utils/` (`aiGeneration.js`, `generateContent.js`, `toolPrompts.js`). These call the backend `/api` endpoints.

### Backend (`backend/`)

Python FastAPI app deployed on Render.

- `main.py` — FastAPI entry point, CORS, router registration
- `database.py` — psycopg2 connection pool, `query(sql, params)` helper
- `email_service.py` — SMTP email sending (mock mode if SMTP not configured)
- `routers/auth.py` — `/api/auth/{register,login,verify-email,resend-code}`
- `routers/ai.py` — `/api/ai/{generate-content,generate-presentation,tts,tulga-content}`
- `routers/presentations.py` — `/api/presentation-api` CRUD
- `routers/tapqyr.py` — `/api/tapqyr-{quizzes,sessions,players,answer}`
- `routers/admin.py` — `/api/admin/{stats,users}`
- `routers/analytics.py` — `/api/analytics`

> The old `server/` (Node/Express) and `netlify/functions/` are legacy and no longer used.

### Database

PostgreSQL via Neon. Schema SQL files in `server/database/`:
- `presentation-tables.sql`
- `tapqyr-tables.sql`
- `analytics-tables.sql`

Run `npm run init-db` to apply schemas.

### Key Data Flows

1. **Content Generation:** `src/pages/*.jsx` → `src/utils/aiGeneration.js` → `POST /api/ai/generate` (or Netlify function) → OpenAI API
2. **Presentation:** `src/pages/Presentation.jsx` → `src/utils/presentationApi.js` → `/api/presentations` → PostgreSQL
3. **Quiz Game (Tapqyr):** `src/utils/tapqyrApi.js` → `/api/tapqyr/*` → PostgreSQL

## Environment Variables

Required in `.env` (not committed):
```
DATABASE_URL=       # Neon PostgreSQL connection string
PORT=5000
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

For Netlify, these are set in `netlify.toml` and Netlify dashboard environment variables.

## Styling

Tailwind CSS 4 with custom theme extensions in `tailwind.config.js` (colors, fonts, shadows). PostCSS processes styles via `postcss.config.js`. CSS linting is suppressed in `.vscode/settings.json` to avoid Tailwind directive warnings.
