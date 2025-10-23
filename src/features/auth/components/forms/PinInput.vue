<script setup lang="ts">
interface Props {
  modelValue: string
  length?: number
  disabled?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'complete', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  length: 5,
  disabled: false,
  loading: false
})

const emit = defineEmits<Emits>()

const addDigit = (digit: number) => {
  if (props.disabled || props.loading) return
  
  const newValue = props.modelValue + digit.toString()
  emit('update:modelValue', newValue)
  
  if (newValue.length === props.length) {
    emit('complete', newValue)
  }
}
</script>

<template>
  <div class="pin-input">
    <!-- PIN Indicators -->
    <div class="flex justify-center gap-4 mb-8">
      <div 
        v-for="i in length" 
        :key="`indicator-${i}`" 
        :class="[
          modelValue.length < i ? 'border-white' : 'bg-white',
          'h-3 w-3 rounded-full border transition-colors'
        ]"
      />
    </div>

    <!-- Number Pad -->
    <div class="grid grid-cols-3 gap-4">
      <div 
        v-for="digit in 9" 
        :key="`digit-${digit}`" 
        class="flex items-center justify-center"
      >
        <button
          type="button"
          @click="() => addDigit(digit)"
          :disabled="disabled || loading"
          class="flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 text-xl text-gray-200 transition-all hover:border-white hover:text-3xl hover:text-white hover:shadow hover:shadow-white disabled:opacity-50 disabled:pointer-events-none"
        >
          {{ digit }}
        </button>
      </div>

      <!-- Number 0 -->
      <div class="col-start-2 flex items-center justify-center">
        <button
          type="button"
          @click="() => addDigit(0)"
          :disabled="disabled || loading"
          class="button-digit"
          :class="{ 'opacity-50 pointer-events-none': disabled || loading }"
        >
          0
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.button-digit {
  @apply flex h-16 w-16 items-center justify-center rounded-full border border-gray-200 text-xl text-gray-200 transition-all hover:border-white hover:text-3xl hover:text-white hover:shadow hover:shadow-white;
}
</style>