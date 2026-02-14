# Now or Never – Live RMV Departures

Now or Never is a Nuxt 4 app that renders a real-time departure board for the
RMV network around Darmstadt Lincoln-Siedlung. The frontend is built with Nuxt
UI, Tailwind, and a custom TramCountdown component, while the backend logic runs
as a Nitro serverless function that proxies the RMV HAFAS API.

## Tech Stack

- Nuxt 4 + Nitro for SSR/serverless routes
- Nuxt UI + Tailwind CSS for the interface
- Axios + xml2js for RMV API parsing
- pnpm for dependency management
- Vitest for API contract tests
- GitHub Actions CI + Vercel hosting (Production/Preview)

## Local Development

1. Install dependencies (Node 22+):

   ```bash
   pnpm install
   ```

2. Configure your RMV HAFAS API key:

   ```bash
   cp .env .env.local   # or create manually
   # In .env.local
   RMV_API_KEY=your_api_key
   ```

   `RMV_API_KEY` is read on the server via Nuxt runtime config. The legacy
   `VITE_API_KEY` is only used as a fallback for backwards compatibility.

3. Start the dev server:

   ```bash
   pnpm dev
   ```

4. Run tests/linting as needed:

   ```bash
   pnpm test        # Vitest API checks
   pnpm lint        # ESLint
   pnpm typecheck   # Nuxt type analyzer
   ```

## Production Build

```bash
pnpm run build      # creates .output for Nitro/Vercel
pnpm run preview    # serve the production bundle locally
```

## CI/CD Concept

### Continuous Integration (GitHub Actions)

`.github/workflows/ci.yml` runs on every push/pull request:

1. Install pnpm dependencies
2. Lint (`pnpm lint`)
3. Typecheck (`pnpm typecheck`)
4. Run tests (`pnpm test:run`)

No artifacts are published; the goal is to ensure the Vite/Nuxt build stays
healthy before Vercel receives the commit.

### Continuous Deployment (Vercel)

- The `main` branch is connected to the Vercel project `now-or-never-two`.
- Environment variable `RMV_API_KEY` must be defined for Production, Preview,
  and Development scopes in Vercel.
- On push, Vercel builds the Nuxt project with `pnpm install && pnpm build`,
  deploys a preview, and promotes it to production when merged to `main`.
- Nitro inlines the Axios dependency (`nitro.externals.inline = ['axios']`) so
  serverless functions never depend on global modules at runtime.

### Deployment Checklist

1. `RMV_API_KEY` set in Vercel + local `.env`
2. Tests and lint pass locally (`pnpm test`, `pnpm lint`)
3. CI pipeline green on GitHub
4. Vercel preview renders live departures at `/`

## Troubleshooting

- **Empty board / error text** – check `https://<app>/api/departures` for the
  JSON payload; missing API key or RMV errors are echoed there.
- **Vercel 500 “Cannot find package 'axios'”** – ensure the latest commit with
  `axios` in `dependencies` is deployed; redeploy if necessary.
- **Local dev 401** – confirm `RMV_API_KEY` is present and restart `pnpm dev`.

## License

MIT © 2026 Tim Longerich