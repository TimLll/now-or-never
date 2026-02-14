<template>
  <div class="tram-countdown">
    <h1 class="text-black text-5xl font-semibold mb-2 pb-1 text-center border-dotted border-b-2 font-bangers bg-linear-to-r from-pink-600 to-fuchsia-900 bg-clip-text text-transparent">
      Now or Never!
    </h1>
    <p class="text-center text-white/80 text-3xl font-bold mb-8">{{ stationName }}</p>
    <div class="board">
      <p v-if="errorMessage" class="text-center text-red-400 font-medium mb-4">{{ errorMessage }}</p>
        <div v-if="visibleDepartures.length" class="departure-list">
          <div
            v-for="dep in visibleDepartures"
          :key="dep.plannedDeparture + dep.line + dep.destination"
          class="departure-row"
        >
          <span class="line-chip">{{ dep.line ?? '?' }}</span>
          <span class="destination">{{ dep.destination ?? 'Unbekannt' }}</span>
          <span class="time">{{ formatTime(dep.plannedDeparture) }}</span>
          <span class="countdown" :class="countdownClass(dep.plannedDeparture)">
            {{ countdownDisplay(dep.plannedDeparture) }}
          </span>
        </div>
      </div>
        <p v-else class="text-center text-white/70">Keine Abfahrten in den nächsten Minuten.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Departure {
  line?: string
  destination?: string
  plannedDeparture: string // ISO
}

interface DeparturesResponse {
  station: { id: string; name: string }
  departures: Departure[]
  error?: string
}

const departures = ref<Departure[]>([])
const stationName = ref('Darmstadt Lincoln-Siedlung')
const errorMessage = ref<string | null>(null)

const fetchDepartures = async () => {
  try {
    const data = await $fetch<DeparturesResponse>('/api/departures')
    departures.value = data.departures ?? []
    stationName.value = data.station?.name ?? stationName.value
    errorMessage.value = data.error ?? null
    updateCountdowns()
  } catch (error) {
    console.error('Failed to fetch departures', error)
    departures.value = []
    errorMessage.value = 'Abfahrten konnten nicht geladen werden.'
  }
}

// Reaktive Map für Countdowns
const countdowns = ref<Record<string, number>>({})
const visibleDepartures = computed(() =>
  departures.value.filter((dep) => (countdowns.value[dep.plannedDeparture] ?? Number.POSITIVE_INFINITY) > 0)
)

function updateCountdowns() {
  const activeKeys = new Set<string>()
  departures.value.forEach(dep => {
    if (!dep.plannedDeparture) return
    const depTime = new Date(dep.plannedDeparture).getTime()
    const now = Date.now()
    const remaining = Math.max(depTime - now, 0)
    countdowns.value[dep.plannedDeparture] = remaining
    activeKeys.add(dep.plannedDeparture)
  })
  Object.keys(countdowns.value).forEach((key) => {
    if (!activeKeys.has(key)) {
      delete countdowns.value[key]
    }
  })
}

let countdownTimer: ReturnType<typeof setInterval> | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchDepartures()
  countdownTimer = setInterval(updateCountdowns, 50)
  refreshTimer = setInterval(fetchDepartures, 20000)
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function countdownDisplay(iso: string) {
  const ms = countdowns.value[iso] ?? 0
  if (ms <= 0) return '00:00:00'
  const min = Math.floor(ms / 60000)
  const sec = Math.floor((ms % 60000) / 1000)
  const hund = Math.floor((ms % 1000) / 10)
  return `${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}:${hund.toString().padStart(2,'0')}`
}
function countdownClass(iso: string) {
  const ms = countdowns.value[iso] ?? 0
  const min = Math.floor(ms / 60000)
  if (ms <= 0) {
    return 'text-red-600'
  }
  if (min < 10) {
    // Blinken: alle 500ms sichtbar/unsichtbar
    return {
      'text-red-600': true,
      'animate-blink': Math.floor((ms % 1000) / 500) === 0
    }
  }
  return 'text-gray-800'
}
</script>

<style scoped>
.tram-countdown {
  max-width: 900px;
  height: 900px;
  min-width: 450px;
  margin: 0 auto;
  background: linear-gradient(90deg,rgb(7, 0, 33) 0%, rgb(6, 0, 59) 100%);
  /* background: rgb(4, 0, 32);*/
  border-radius: 1rem;
  box-shadow: 0 2px 8px #0001;
  padding: 3.5rem;
}
 .tram-countdown {
   display: flex;
   flex-direction: column;
   align-items: center;
 }
 .board {
   width: 100%;
   background: #fff;
   border-radius: 1rem;
   padding: 2rem;
   box-shadow: inset 0 0 0 1px #0000000d;
 }
 .departure-list {
   display: flex;
   flex-direction: column;
   gap: 1rem;
 }
 .departure-row {
   display: grid;
   grid-template-columns: 90px 1fr 100px 160px;
   gap: 1rem;
   align-items: center;
   padding-bottom: 0.75rem;
   border-bottom: 1px dashed #1f1f1f21;
 }
 .departure-row:last-child {
   border-bottom: none;
 }
 .line-chip {
   font-weight: 700;
   padding: 0.35rem 0.65rem;
   border-radius: 999px;
   background: linear-gradient(120deg, #f97316, #db2777);
   color: #fff;
   text-align: center;
   width: 3.5rem;
 }
 .destination {
   font-size: 1.1rem;
   font-weight: 500;
 }
 .time {
   font-family: 'Space Mono', 'Fira Code', monospace;
   font-size: 1.4rem;
   text-align: right;
 }
 .countdown {
   font-size: 1.4rem;
   font-family: 'Space Mono', 'Fira Code', monospace;
   justify-self: end;
 }
@media (max-width: 800px) {
  .departure-row {
    grid-template-columns: 70px 1fr;
    gap: 0.75rem;
  }
  .time,
  .countdown {
    text-align: left;
    justify-self: flex-start;
  }
}
 .font-bangers {
   font-family: 'Monoton';
   min-width: 300px;
 }
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink {
  animation: blink 0.5s steps(3, start) infinite;
}
</style>
