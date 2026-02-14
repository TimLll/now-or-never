# Project Documentation

## 1. Architecture Overview

- **Frontend**: Nuxt 4 + Nuxt UI renders the TramCountdown component. All data
  is fetched through the `/api/departures` endpoint so the browser never sees
  the RMV API key.
- **Backend**: Nitro serverless route `server/api/departures.ts` wraps the RMV
  HAFAS API using Axios + xml2js, caches station ids, and normalises departures
  to a compact schema consumed by the UI.
- **Styling**: Tailwind CSS via `@tailwindcss/vite` plugin.
- **Testing**: Vitest checks API contract expectations in `tests/`.

## 2. Environment & Secrets

| Variable      | Scope   | Description                                             |
|---------------|---------|---------------------------------------------------------|
| `RMV_API_KEY` | Server  | Required. Used by Nitro runtime via `runtimeConfig`.     |
| `VITE_API_KEY`| Server  | Legacy fallback; avoid using unless necessary.          |

Usage rules:

1. Define `RMV_API_KEY` in local `.env` (ignored by git) and in Vercel →
   Project Settings → Environment Variables (Production + Preview + Dev).
2. The server handler reads `useRuntimeConfig().rmvApiKey`. If missing it returns
   a friendly error payload so the UI can warn the user.
3. The frontend never appends the key to the request (see
   `app/components/TramCountdown.vue`).

## 3. CI/CD Concept

### Continuous Integration

Workflow: `.github/workflows/ci.yml`

- Trigger: every push/pull_request
- Runs on `ubuntu-latest` with Node 22 and pnpm
- Steps: install deps → `pnpm lint` → `pnpm typecheck` → `pnpm test:run`
- Purpose: keep the Nuxt/Vite pipeline healthy before deploying to Vercel

### Continuous Deployment

- Provider: Vercel (`now-or-never-two` project)
- Source: GitHub `main` branch
- Build command: `pnpm install && pnpm build`
- Output: `.output` consumed by Vercel’s Nitro adapter
- Env vars: `RMV_API_KEY` set per environment scope in the Vercel UI
- Promotion: every push gets a Preview URL; merges to `main` become Production

## 4. Developer Workflow

| Action                   | Command                     | Notes                                      |
|--------------------------|-----------------------------|--------------------------------------------|
| Install deps             | `pnpm install`              | Requires Node 22+                          |
| Start dev server         | `pnpm dev`                  | Auto reload, uses `.env` secrets           |
| Lint                     | `pnpm lint`                 | ESLint config via `@nuxt/eslint`           |
| Typecheck                | `pnpm typecheck`            | Nuxt’s type analyzer                       |
| Unit/API tests           | `pnpm test` or `pnpm vitest`| Uses Vitest + fetch against dev server     |
| Production build         | `pnpm build`                | Generates `.output` for Nitro/Vercel       |
| Preview prod bundle      | `pnpm preview`              | Runs `.output/server/index.mjs` locally    |

## 5. Troubleshooting

| Symptom                                           | Resolution                                                                 |
|---------------------------------------------------|----------------------------------------------------------------------------|
| `/api/departures` returns 500 on Vercel           | Ensure latest commit (with Axios in dependencies) is deployed; redeploy.   |
| UI shows “Abfahrten konnten nicht geladen werden” | Inspect `/api/departures` JSON for `error`; most cases are missing API key |
| Local dev cannot authenticate                     | Verify `.env` contains `RMV_API_KEY` and restart `pnpm dev`.               |
| CI fails fetching RMV data                        | Mock responses or temporarily skip live tests when API is unavailable.     |

## 6. Operational Checklist

1. Secret rotation: update `RMV_API_KEY` in Vercel + `.env` simultaneously
2. Dependency updates via Renovate/`pnpm up` should be followed by `pnpm test`
3. Observe Vercel function logs for RMV rate limit errors
4. Keep `.output/` and `.nuxt/` out of git (already ignored)