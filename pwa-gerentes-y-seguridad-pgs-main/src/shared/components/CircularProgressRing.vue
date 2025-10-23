<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  progress: number // 0-1
  color: string
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 200
})

const FULL_DASH_ARRAY = 283

const strokeDasharray = computed(() => {
  const progressValue = Math.max(0, Math.min(1, props.progress))
  const circleDasharray = `${(progressValue * FULL_DASH_ARRAY).toFixed(0)} 283`
  return circleDasharray
})
</script>

<template>
  <div class="circular-progress" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg class="circular-progress__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g class="circular-progress__circle">
        <circle class="circular-progress__path-elapsed" cx="50" cy="50" r="45"></circle>
        <path
          :stroke-dasharray="strokeDasharray"
          :class="['circular-progress__path-remaining', color]"
          d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          "
        ></path>
      </g>
    </svg>
    <div class="circular-progress__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.circular-progress {
  position: relative;
  margin: auto;
}

.circular-progress__svg {
  transform: scaleX(-1);
}

.circular-progress__circle {
  fill: none;
  stroke: none;
}

.circular-progress__path-elapsed {
  stroke-width: 7px;
  stroke: grey;
}

.circular-progress__path-remaining {
  stroke-width: 7px;
  stroke-linecap: round;
  transform: rotate(90deg);
  transform-origin: center;
  transition: 1s linear all;
  fill-rule: nonzero;
  stroke: currentColor;
}

.circular-progress__path-remaining.green {
  color: oklch(72.3% 0.219 149.579);
}

.circular-progress__path-remaining.orange {
  color: oklch(70.5% 0.213 47.604);
}

.circular-progress__path-remaining.red {
  color: oklch(63.7% 0.237 25.331);
}

.circular-progress__content {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>