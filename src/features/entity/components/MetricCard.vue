<script lang="ts" setup>
interface Props {
  title: string
  value: string | number
  valueClass?: string
}

withDefaults(defineProps<Props>(), {
  valueClass: 'text-gray-400'
})
</script>

<template>
  <div class="space-y-2">
    <h5 class="title">{{ title }}</h5>
    <p :class="valueClass">{{ value }}</p>
  </div>
</template>