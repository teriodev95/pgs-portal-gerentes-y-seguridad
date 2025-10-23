<script setup lang="ts">
interface Props {
  pin: string
  timeLeft: string
}

defineProps<Props>()
</script>

<template>
  <div class="timer-display">
    <div class="timer-display__pin">{{ pin }}</div>
    <div class="timer-display__time">{{ timeLeft }}</div>
  </div>
</template>

<style scoped>
.timer-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.timer-display__pin {
  font-size: 56px;
  font-weight: bold;
  color: #1f2937;
  letter-spacing: 2px;
}

.timer-display__time {
  font-size: 18px;
  font-weight: 500;
  color: #6b7280;
}
</style>