import { ref, watch, type Ref } from 'vue'

export function useCountUp(target: Ref<number>, duration = 800) {
  const current = ref(0)
  let raf = 0

  watch(target, (end) => {
    cancelAnimationFrame(raf)
    const start = current.value
    const diff = end - start
    if (diff === 0) return

    const startTime = performance.now()

    function step(now: number) {
      const t = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3) // easeOutCubic
      current.value = start + diff * ease
      if (t < 1) raf = requestAnimationFrame(step)
      else current.value = end
    }

    raf = requestAnimationFrame(step)
  }, { immediate: true })

  return current
}
