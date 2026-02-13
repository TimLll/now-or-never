// Mock-API für Abfahrten Lincoln-Siedlung
// Rückgabeformat wie RMV HAFAS departures-API (vereinfacht)

export default defineEventHandler(() => {
  // Beispiel: Zwei Richtungen, je 2 Abfahrten
  return {
    northbound: [
      { line: '3', destination: 'Lichtenbergschule', plannedDeparture: '2026-02-13T10:40:00+01:00' },
      { line: '3', destination: 'Lichtenbergschule', plannedDeparture: '2026-02-13T10:30:00+01:00' }
    ],
    southbound: [
      { line: '3', destination: 'Lichtenbergschule', plannedDeparture: '2026-02-13T10:50:00+01:00' },
      { line: '3', destination: 'Lichtenbergschule', plannedDeparture: '2026-02-13T10:40:00+01:00' }
    ]
  }
})
