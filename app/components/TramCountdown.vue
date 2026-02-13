<template>
  <div class="tram-countdown">
    <h1 class="text-black text-6xl font-semi-bold mb-8 pb-1 text-center border-dotted border-b-2 font-bangers bg-linear-to-r from-pink-600 to-fuchsia-900 bg-clip-text text-transparent ...">Now or Never!</h1>
    <div class="text-black grid grid-cols-2 gap-20 tram-countdown-grid w-full justify-center bg-white rounded-xl p-10">
      <div class="flex flex-col items-center">
        <h3 class="text-black text-2xl font-semibold pb-1 opacity-65 decoration-dotted underline">Linie {{ north[0]?.line }} {{ north[0]?.destination }}</h3>
          <div v-if="north[0]">
            <div class="flex items-center gap-2 justify-end">
              <span class="font-mono text-3xl pr-2">{{ formatTime(north[0].plannedDeparture) }}</span>
              <span :class="['text-3xl', countdownClass(north[0].plannedDeparture)]">{{ countdownDisplay(north[0].plannedDeparture) }}</span>
            </div>
          </div>
      </div>
      <div class="flex flex-col items-center">
        <h3 class="text-2xl font-semibold pb-1 opacity-65 decoration-dotted underline">Linie {{ south[0]?.line }} {{ south[0]?.destination }}</h3>
          <div v-if="south[0]">
            <div class="flex items-center gap-2 justify-start">
              <span class="font-mono text-3xl pr-2">{{ formatTime(south[0].plannedDeparture) }}</span>
              <span :class="['text-3xl', countdownClass(south[0].plannedDeparture)]">{{ countdownDisplay(south[0].plannedDeparture) }}</span>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Departure {
  line: string
  destination: string
  plannedDeparture: string // ISO
}

const north = ref<Departure[]>([])
const south = ref<Departure[]>([])

const fetchDepartures = async () => {
  const data = await $fetch('/api/departures')
  north.value = data.northbound
  south.value = data.southbound
}

// Reaktive Map für Countdowns
const countdowns = ref<Record<string, number>>({})

function updateCountdowns() {
  const update = (depList: Departure[]) => {
    depList.forEach(dep => {
      const depTime = new Date(dep.plannedDeparture).getTime()
      const now = Date.now()
      countdowns.value[dep.plannedDeparture] = Math.max(depTime - now, 0)
    })
  }
  update(north.value)
  update(south.value)
}

let timer: number | undefined
onMounted(() => {
  fetchDepartures()
  timer = setInterval(() => {
    updateCountdowns()
  }, 10) // 10ms für Hundertstel
  const depInterval = setInterval(fetchDepartures, 20000)
  onUnmounted(() => {
    clearInterval(timer)
    clearInterval(depInterval)
  })
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
  max-width: 650px;
  margin: 0;
  background: linear-gradient(90deg,rgb(7, 0, 33) 0%, rgb(6, 0, 59) 100%);
  /* background: rgb(4, 0, 32);*/
  border-radius: 1rem;
  box-shadow: 0 2px 8px #0001;
  padding: 3rem;
}
 .tram-countdown-grid {
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 2.5rem;
   align-items: start;
   width: 100%;
   min-width: 300px;
 }
 .tram-countdown-grid > div {
   width: 100%;
 }
 .tram-countdown {
   display: flex;
   flex-direction: column;
   align-items: center;
 }
@media (max-width: 600px) {
  .tram-countdown-grid {
    grid-template-columns: 1fr !important;
    gap: 2rem;
  }
  .tram-countdown-grid > div {
    width: 100%;
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
