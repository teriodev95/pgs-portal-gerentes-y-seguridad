import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TIMER_CONFIG } from '../constants'

interface UseTimerOptions {
  createdAt?: string
  expiresAt?: string
  currentTime?: string
}

export function useTimer(options: UseTimerOptions) {
  const clientTime = ref(Date.now())
  const serverTimeOffset = ref(0)
  const timerInterval = ref<number | null>(null)

  const totalDuration = computed(() => {
    if (!options.createdAt || !options.expiresAt) {
      return TIMER_CONFIG.DEFAULT_DURATION_SECONDS
    }
    const created = new Date(options.createdAt).getTime()
    const expires = new Date(options.expiresAt).getTime()
    const duration = Math.floor((expires - created) / 1000)

    console.log('totalDuration calculation:', {
      createdAt: options.createdAt,
      expiresAt: options.expiresAt,
      created: new Date(options.createdAt),
      expires: new Date(options.expiresAt),
      createdTimestamp: created,
      expiresTimestamp: expires,
      durationSeconds: duration,
      durationMinutes: Math.floor(duration / 60)
    })

    return duration
  })

  const timeLeft = computed(() => {
    if (!options.expiresAt) return 0
    const expires = new Date(options.expiresAt).getTime()
    const adjustedCurrentTime = clientTime.value + serverTimeOffset.value
    const remaining = Math.floor((expires - adjustedCurrentTime) / 1000)

    console.log('timeLeft calculation:', {
      expiresAt: options.expiresAt,
      expires: new Date(options.expiresAt),
      expiresTimestamp: expires,
      clientTime: clientTime.value,
      serverTimeOffset: serverTimeOffset.value,
      adjustedCurrentTime,
      adjustedCurrentTimeFormatted: new Date(adjustedCurrentTime),
      remainingSeconds: remaining,
      remainingMinutes: Math.floor(remaining / 60)
    })

    return Math.max(0, remaining)
  })

  const formattedTime = computed(() => {
    const minutes = Math.floor(timeLeft.value / 60)
    const seconds = timeLeft.value % 60
    const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`
    return `${minutes}:${secondsStr}`
  })

  const progress = computed(() => {
    const rawTimeFraction = timeLeft.value / totalDuration.value
    return rawTimeFraction - (1 / totalDuration.value) * (1 - rawTimeFraction)
  })

  const isExpired = computed(() => timeLeft.value === 0)

  function calculateServerTimeOffset() {
    if (options.currentTime) {
      const serverTime = new Date(options.currentTime).getTime()
      const currentClientTime = Date.now()
      serverTimeOffset.value = serverTime - currentClientTime
      console.log('Server time offset calculated:', {
        serverTime: options.currentTime,
        serverTimestamp: serverTime,
        clientTime: currentClientTime,
        offset: serverTimeOffset.value
      })
    }
  }

  function startTimer() {
    if (timerInterval.value) return

    timerInterval.value = setInterval(() => {
      clientTime.value = Date.now()

      if (timeLeft.value === 0) {
        stopTimer()
      }
    }, TIMER_CONFIG.UPDATE_INTERVAL_MS)
  }

  function stopTimer() {
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }


  onMounted(() => {
    if (options.expiresAt) {
      calculateServerTimeOffset()
      clientTime.value = Date.now()
      startTimer()
    }
  })

  onUnmounted(() => {
    stopTimer()
  })

  return {
    timeLeft,
    formattedTime,
    progress,
    isExpired
  }
}