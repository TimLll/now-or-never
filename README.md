# Now or Never

Live-Abfahrtsanzeige für die Lincoln-Siedlung (RMV) auf Basis von Nuxt 4.

## Überblick

- Frontend: Nuxt UI + Tailwind + `TramCountdown`
- Backend: Nitro API Route für RMV HAFAS (`server/api/departures.ts`)
- Tests: Vitest API-Tests in `tests/`
- Hosting: Vercel

## Voraussetzungen

- Node.js 22+
- pnpm 10+
- RMV API Key

## Setup

1. Dependencies installieren:

   ```bash
   pnpm install
   ```

2. Environment Variable setzen (`.env` oder `.env.local`):

   ```bash
   RMV_API_KEY=your_api_key
   ```

3. Dev-Server starten:

   ```bash
   pnpm dev
   ```

## Wichtige Scripts

- `pnpm dev` – lokale Entwicklung
- `pnpm build` – Production Build
- `pnpm preview` – Production Build lokal starten
- `pnpm lint` – ESLint
- `pnpm typecheck` – Nuxt Typecheck
- `pnpm test` / `pnpm test:run` – Vitest

## API-Endpunkte

- `GET /api/departures`
  - Live-Abfahrten für die konfigurierte Station
  - nutzt `RMV_API_KEY` serverseitig

- `GET /api/stops/:stopId/departures?limit=...`
  - Mock-Endpunkt (z. B. für Tests/Entwicklung)
  - `limit` Default: 2, Min: 1, Max: 5

## Deploy (Vercel)

- In Vercel muss `RMV_API_KEY` für Production/Preview/Development gesetzt sein.
- Der produktive Deploy folgt dem in Vercel eingestellten `Production Branch`:
  - Vercel → Project → Settings → Git → Production Branch

## Troubleshooting

- Leere Anzeige: `/api/departures` direkt aufrufen und `error` prüfen.
- Alter Seitentitel sichtbar: Browser Hard-Reload (`Ctrl+F5`) und ggf. Vercel/CDN Cache revalidieren.
- Kein automatischer Deploy: Vercel `Production Branch` und Git-Webhook prüfen.

## Dokumentationsänderung

### Was wurde geändert?

- README neu strukturiert und auf aktuellen Projektstand gebracht.
- Veraltete Branch-Aussagen (z. B. fester `main`-Flow) entfernt.
- Setup, Scripts, API-Endpunkte und Deploy-Pfade konkretisiert.

### Warum?

- Schnellere Einarbeitung und weniger Missverständnisse beim Deploy.
- Konsistenz mit aktuellem Code und aktuellem Vercel-Workflow.

### Wie testen/prüfen?

- Commands aus „Setup“ und „Wichtige Scripts“ lokal ausführen.
- `/api/departures` und `/api/stops/lincoln/departures?limit=2` im Browser testen.
- In Vercel prüfen, ob der richtige `Production Branch` gesetzt ist.

## License

MIT © 2026 Tim Longerich