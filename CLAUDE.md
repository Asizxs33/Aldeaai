# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Aldea AI** is a full-stack educational AI platform with multi-language support (English, Russian, Kazakh). It provides AI-powered content generation, interactive learning games, user authentication, and subscription management.

## Commands

```bash
# Frontend dev server (with HMR) — runs on port 5173
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Preview production build
npm run preview

# --- Legacy (Node/Express, no longer the active backend) ---
npm run server    # starts server/server.js on port 5000
npm run init-db   # runs server/init-db.js to apply SQL schemas
```

## Architecture

### Deployment Model

- **Frontend:** Vercel (React/Vite, `npm run build`)
- **Backend:** Render (Python/FastAPI, `backend/`)
- **Local development:** Vite (`npm run dev`) proxies both `/.netlify/functions/*` and `/api/*` to FastAPI at `localhost:8000`. The proxy rewrites Netlify-style function paths to FastAPI routes (see `vite.config.js` — ~28 proxy rules). The old Express server (`server/`) and Netlify Functions (`netlify/`) are **legacy and unused**.

### Running Locally

```bash
# Terminal 1 — Python backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
npm run dev
```

### Frontend (`src/`)

- **Routing:** React Router v7 in `App.jsx`. Protected routes use `src/components/ProtectedRoute.jsx` with an optional `allowedRoles` prop for role-based access.
- **Roles:** `user`, `pro`, `ultra`, `moderator`, `admin`. Premium pages (Presentation, Games) require `pro`/`ultra`/`moderator`/`admin`.
- **Layouts:** `src/layouts/DashboardLayout.jsx` wraps all authenticated pages.
- **Global State:** Three contexts in `src/contexts/`:
  - `AuthContext` — user session and data
  - `LanguageContext` — active language (EN/RU/KK)
  - `ThemeContext` — dark/light mode
- **Translations:** All UI strings live in `src/translations/` (single large file). Access via `useTranslations()` hook.
- **AI Utilities:** `src/utils/aiGeneration.js`, `generateContent.js`, `toolPrompts.js` — these call backend `/api` endpoints.

### Backend (`backend/`)

Python FastAPI app deployed on Render. CORS allows `FRONTEND_URL` env var (defaults to `http://localhost:5173`).

- `main.py` — FastAPI entry point, CORS config, router registration
- `database.py` — psycopg2 connection pool, `query(sql, params)` helper
- `email_service.py` — SMTP email (falls back to mock/log mode if SMTP not configured)
- `routers/auth.py` — `/api/auth/{register,login,verify-email,resend-code}`
- `routers/ai.py` — `/api/ai/{generate-content,generate-presentation,tts,tulga-content}`
- `routers/presentations.py` — `/api/presentation-api` CRUD
- `routers/tapqyr.py` — `/api/tapqyr-{quizzes,sessions,players,answer}`
- `routers/admin.py` — `/api/admin/{stats,users}`
- `routers/analytics.py` — `/api/analytics`
- Health check: `GET /api/health`

### Database

PostgreSQL via Neon. Schema SQL files in `server/database/` (applied via the legacy `npm run init-db`):
- `presentation-tables.sql`
- `tapqyr-tables.sql`
- `analytics-tables.sql`

### Key Data Flows

1. **Content Generation:** `src/pages/*.jsx` → `src/utils/aiGeneration.js` → `POST /api/ai/generate-content` → OpenAI API
2. **Presentation:** `src/pages/Presentation.jsx` → `src/utils/presentationApi.js` → `/api/presentation-api` → PostgreSQL
3. **Quiz Game (Tapqyr):** `src/utils/tapqyrApi.js` → `/api/tapqyr-*` → PostgreSQL

## Environment Variables

### Backend (`backend/.env`, see `backend/.env.example`)
```
DATABASE_URL=       # Neon PostgreSQL connection string (sslmode=require)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
FRONTEND_URL=       # e.g. https://your-app.vercel.app (used for CORS)
```

### Frontend (root `.env`)
No build-time env vars required — all API calls are proxied through Vite in dev and hit the Render backend URL directly in production.

## Styling

Tailwind CSS 4 with custom theme extensions in `tailwind.config.js` (colors, fonts, shadows). PostCSS processes styles via `postcss.config.js`. CSS linting is suppressed in `.vscode/settings.json` to avoid Tailwind directive warnings.

## Testing

There is no active test suite. Two legacy test scripts exist in `server/` (`test-auth.js`, `test-db-connection.js`) but they target the old Express backend.
