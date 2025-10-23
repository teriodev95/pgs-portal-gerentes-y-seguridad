<script setup lang="ts">
import { computed } from 'vue'
import { toCurrency } from '@/shared/utils'
import AngleRight from '@/shared/components/icons/AngleRight.vue'
import AnnotationIcon from '@/shared/components/icons/AnnotationIcon.vue'
import PlusIcon from '@/shared/components/icons/PlusIcon.vue'
import type { ModalConfigKey } from '@/features/weekly-close/types'

interface Props {
  label: string
  value: number | undefined
  modalKey: ModalConfigKey
  isLocked?: boolean
  showCurrency?: boolean
  hasReason?: boolean
  reasonText?: string
  reasonModalKey?: ModalConfigKey
}

interface Emits {
  (event: 'edit', modalKey: ModalConfigKey): void
}

const props = withDefaults(defineProps<Props>(), {
  isLocked: false,
  showCurrency: true,
  hasReason: false
})

const emit = defineEmits<Emits>()

/**
 * Computed property for button styling based on locked state
 */
const buttonClasses = computed(() => ({
  'btn-manual-number flex items-center justify-center gap-2': true,
  'cursor-default opacity-50': props.isLocked
}))

/**
 * Computed property for formatted display value
 */
const displayValue = computed(() => {
  if (props.showCurrency) {
    return toCurrency(props.value)
  }
  return props.value?.toString() || '0'
})

/**
 * Handle edit button click for value
 */
const handleEdit = () => {
  if (!props.isLocked) {
    emit('edit', props.modalKey)
  }
}

/**
 * Handle reason/motivo button click
 */
const handleReasonEdit = () => {
  if (!props.isLocked && props.reasonModalKey) {
    emit('edit', props.reasonModalKey)
  }
}
</script>

<template>
  <!-- Simple mode: only value -->
  <div v-if="!hasReason" class="flex justify-between gap-2">
    <p class="font-300 text-gray-400">{{ label }}</p>
    <button
      @click="handleEdit"
      :class="buttonClasses"
      :disabled="isLocked"
    >
      {{ displayValue }}
      <AngleRight class="h-2 w-2" />
    </button>
  </div>

  <!-- Complex mode: value + reason -->
  <div v-else class="flex items-center justify-between gap-2">
    <div>
      <p class="font-300 text-gray-400">{{ label }}</p>
      <p
        v-if="reasonText"
        class="font-sm-700 flex items-center gap-1 text-gray-400"
      >
        <AnnotationIcon class="h-4 w-4" />
        <span class="w-[80%]">{{ reasonText }}</span>
      </p>
    </div>

    <div class="flex gap-2">
      <button
        @click="handleReasonEdit"
        class="btn-manual-reason flex items-center justify-center gap-2"
        :class="{ 'cursor-default opacity-50': isLocked }"
        :disabled="isLocked"
      >
        Motivo
        <PlusIcon class="h-2 w-2" />
      </button>

      <button
        @click="handleEdit"
        :class="buttonClasses"
        :disabled="isLocked"
      >
        {{ displayValue }}
        <AngleRight class="h-2 w-2" />
      </button>
    </div>
  </div>
</template>