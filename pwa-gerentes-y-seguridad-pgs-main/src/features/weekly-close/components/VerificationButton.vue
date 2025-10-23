<script setup lang="ts">
import ArrowRightIcon from '@/shared/components/icons/ArrowRightIcon.vue'

interface Props {
  userType: 'agente' | 'gerente'
  isCompleted: boolean
  isDisabled?: boolean
}

interface Emit {
  (event: 'click'): void
}

defineProps<Props>()
defineEmits<Emit>()
</script>

<template>
  <button
    :class="[
      isCompleted
        ? 'bg-green-outline text-green-500 border-green-500'
        : 'bg-primary-outline text-blue-500 border-blue-500'
    ]"
    :disabled="isDisabled || isCompleted"
    @click="$emit('click')"
    class="btn-primary-outline flex w-full items-center justify-center gap-2 border"
    type="button"
  >
    <p>
      Firma del
      <span class="font-bold" :class="[isCompleted ? 'text-green-600' : 'text-blue-500']">
        {{ userType === 'agente' ? 'Agente' : 'Gerente' }}
      </span>
    </p>
    <ArrowRightIcon
      :class="[isCompleted ? 'text-green-600' : 'text-blue-600']"
      class="h-5 w-5"
    />
  </button>
</template>