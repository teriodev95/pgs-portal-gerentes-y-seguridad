<script setup lang="ts">
type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'div'
type TextVariant = 'primary' | 'secondary' | 'tertiary' | 'title' | 'paragraph' |  'paragraph-bold' | 'label' | 'error' | 'success'

interface Props {
  as?: TextElement
  variant?: TextVariant
}

withDefaults(defineProps<Props>(), {
  as: 'p',
  variant: 'paragraph'
})
</script>

<template>
  <component :is="as" :class="{
    'primary-text': variant === 'primary',
    'secondary-text': variant === 'secondary',
    'tertiary-text': variant === 'tertiary',
    'title-text': variant === 'title',
    'paragraph-text': variant === 'paragraph',
    'paragraph-bold-text': variant === 'paragraph-bold',
    'label-text': variant === 'label',
    'error-text': variant === 'error',
    'success-text': variant === 'success'
  }">
    <slot />
  </component>
</template>
