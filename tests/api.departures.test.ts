import { describe, it, expect } from 'vitest'

const BASE_URL = process.env.NUXT_TEST_BASE_URL ?? 'http://localhost:3000'

async function getJson(path: string) {
  const res = await fetch(`${BASE_URL}${path}`)
  expect(res.ok).toBe(true)
  return res.json()
}

describe('GET /api/stops/:stopId/departures', () => {
  it('default limit = 2 when limit is missing', async () => {
    const data = await getJson('/api/stops/lincoln/departures')
    expect(data.stop?.id).toBe('lincoln')
    expect(Array.isArray(data.departures)).toBe(true)
    expect(data.departures.length).toBe(2)
  })

  it('clamps limit to max = 5', async () => {
    const data = await getJson('/api/stops/lincoln/departures?limit=99')
    expect(data.departures.length).toBe(5)
  })

  it('falls back to default when limit is invalid', async () => {
    const data = await getJson('/api/stops/lincoln/departures?limit=abc')
    expect(data.departures.length).toBe(2)
  })
})