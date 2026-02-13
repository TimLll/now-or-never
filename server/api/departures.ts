// Mock-API für Abfahrten Lincoln-Siedlung
// Rückgabeformat wie RMV HAFAS departures-API (vereinfacht)

export default defineEventHandler(() => {
  // Beispiel: Zwei Richtungen, je 2 Abfahrten
  return {
    northbound: [
      { line: '8', destination: 'Arheilgen', plannedDeparture: '2026-02-13T15:45:00+01:00' },
      { line: '8', destination: 'Arheilgen', plannedDeparture: '2026-02-13T16:00:00+01:00' }
    ],
    southbound: [
      { line: '8', destination: 'Alsbach', plannedDeparture: '2026-02-13T16:10:00+01:00' },
      { line: '8', destination: 'Alsbach', plannedDeparture: '2026-02-13T16:10:00+01:00' }
    ]
  }
})
