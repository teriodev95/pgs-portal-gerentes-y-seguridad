<script setup lang="ts">
import LoadingIcon from '@/shared/components/icons/LoadingIcon.vue'

defineOptions({
  name: 'ActionButton'
})

withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
}>(), {
  variant: 'primary',
  disabled: false,
  loading: false,
  fullWidth: false,
  size: 'md'
})

defineEmits<{
  click: []
}>()

const variantClasses = {
  primary: 'btn-primary-outline',
  secondary: 'btn-secondary-outline',
  success: 'btn-green-outline',
  danger: '!border-red-800 !text-red-900 !focus:ring-red-300'
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
}
</script>

<template>
  <button
    :disabled="disabled || loading"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      'flex items-center justify-center gap-2 mt-2',
      fullWidth && 'w-full'
    ]"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-center gap-2" :class="fullWidth && 'w-full'">
      <slot />
      <LoadingIcon v-if="loading" class="size-5" />
    </div>
  </button>
</template>