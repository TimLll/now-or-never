export default defineEventHandler((event) => {
  // 1) URL-Parameter lesen
  const stopId = event.context.params?.stopId || 'unknown'

  // 2) Query-Parameter lesen
  const query = getQuery(event)
  const rawLimit = Number(query.limit)

  // 3) limit validieren (Default 2, Min 1, Max 5)
  let limit = 2
  if (!Number.isNaN(rawLimit)) {
    limit = Math.min(5, Math.max(1, rawLimit))
  }

  // 4) Mock-Daten (mehr als nötig, damit limit Sinn ergibt)
  const allDepartures = [
    {
      line: 'U4',
      direction: 'north',
      headsign: 'Hauptbahnhof',
      plannedTime: '2026-02-05T18:03:00.000Z',
      realtimeTime: '2026-02-05T18:04:00.000Z'
    },
    {
      line: 'U4',
      direction: 'south',
      headsign: 'Neu-Isenburg',
      plannedTime: '2026-02-05T18:06:00.000Z',
      realtimeTime: null
    },
    {
      line: 'U5',
      direction: 'north',
      headsign: 'Preungesheim',
      plannedTime: '2026-02-05T18:10:00.000Z',
      realtimeTime: null
    }
  ]

  // 5) Auf limit begrenzen
  const departures = allDepartures.slice(0, limit)

  // 6) Response zurückgeben
  return {
    stop: {
      id: stopId,
      name: 'Lincoln-Siedlung'
    },
    generatedAt: new Date().toISOString(),
    source: 'mock',
    degraded: false,
    dataAgeSeconds: 0,
    departures
  }
})
