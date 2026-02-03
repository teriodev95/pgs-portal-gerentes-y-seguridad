<script setup lang="ts">
import { computed } from 'vue'
import { useTimer } from '../composables/useTimer'
import { TIMER_COLORS, TIMER_CONFIG } from '../constants'
import CircularProgressRing from '@/shared/components/CircularProgressRing.vue'
import TimerDisplay from './TimerDisplay.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import CardContainer from '@/shared/components/CardContainer.vue'

export interface CircularTimerProps {
  pin?: string
  createdAt?: string
  expiresAt?: string
  currentTime?: string
  warningThreshold?: number
  alertThreshold?: number
}

interface Emits {
  (e: 'action:new-pin'): void
}

const props = withDefaults(defineProps<CircularTimerProps>(), {
  pin: '',
  createdAt: '',
  expiresAt: '',
  currentTime: '',
  warningThreshold: 2,
  alertThreshold: 1
})

const emit = defineEmits<Emits>()

// Composable
const {
  timeLeft,
  formattedTime,
  progress,
  isExpired,
} = useTimer({
  createdAt: props.createdAt,
  expiresAt: props.expiresAt,
  currentTime: props.currentTime,
})

const currentColor = computed(() => {
  const timeInMinutes = Math.floor(timeLeft.value / 60)
  const alertThreshold = props.alertThreshold ?? TIMER_CONFIG.ALERT_THRESHOLD_MINUTES
  const warningThreshold = props.warningThreshold ?? TIMER_CONFIG.WARNING_THRESHOLD_MINUTES

  if (timeInMinutes < alertThreshold) {
    return TIMER_COLORS.ALERT
  } else if (timeInMinutes < warningThreshold) {
    return TIMER_COLORS.WARNING
  }
  return TIMER_COLORS.INFO
})

// Expose methods for parent components
defineExpose({
  timeLeft: computed(() => timeLeft.value)
})
</script>

<template>
  <CardContainer class="space-y-8  ">
    <CircularProgressRing
      :progress="progress"
      :color="currentColor"
      :size="200"
    >
      <TimerDisplay
        :pin="props.pin"
        :time-left="formattedTime"
      />
    </CircularProgressRing>

    <BtnComponent v-if="isExpired" @click="emit('action:new-pin')" full-width>
      Generar nuevo Pin
    </BtnComponent>
  </CardContainer>
</template>