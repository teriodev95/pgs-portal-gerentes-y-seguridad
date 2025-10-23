<script setup lang="ts">
import { ref } from 'vue'

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */

import IconCheck from '@/shared/components/icons/CheckIcon.vue'
import ArrowRightIcon from '@/shared/components/icons/ArrowRightIcon.vue'
/**
 * ------------------------------------------
 *	Utils
 * ------------------------------------------
 */

interface Props {
  ctaText?: string
  list?: string[]
  mainText: string
  secondaryText: string
  subText?: string
  type: 'success' | 'error'
}

interface Emit {
  (e: 'action:cancel'): void
}

defineProps<Props>()
const $emit = defineEmits<Emit>()

/**
 * ------------------------------------------
 *	Data
 * ------------------------------------------
 */

const colorPalette = {
  success: {
    bg: 'bg-green-400',
    icon: 'b-green-500',
    btn: 'btn-green-outline'
  },
  error: {
    bg: 'bg-red-400',
    icon: 'bg-red-500',
    btn: 'btn-red-outline'
  }
}

const transition = ref('circle-enter-active')
//const transition = ref('circle-leave-active')

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */

/**
 * handleClickTransition
 *
 */

const handleClickTransition = () => {
  transition.value = 'circle-leave-active'
  $emit('action:cancel')
}
</script>

<template>
  <transition name="circle">
    <div v-if="true" class="absolute bottom-0 left-0 right-0 top-0 z-50 bg-black bg-opacity-60">
      <div class="h-full flex flex-col justify-center items-center " :class="colorPalette[$props.type].bg">

        <div>
          <IconCheck :class="colorPalette[$props.type].icon" class="h-24 w-24 rounded-full border-8 p-6 text-white" />
        </div>

        <div class="space-y-8 p-4 text-white ">
          <div class="space-y-4 p-4 text-center">
            <h2 class="text-2xl font-bold">{{ mainText }}</h2>
            <p v-html="secondaryText"></p>


            <div class="space-y-2">
              <p v-if="subText" class="font-semibold">{{ subText }}</p>
              <template v-if="list">
                <p class="text-center" v-for="item in list" :key="item" v-html="item"></p>
              </template>
            </div>

          </div>

          <button class="w-full btn btn-white-outline flex gap-4 items-center justify-center"
            @click="handleClickTransition">
            {{ $props.ctaText || 'Continuar' }}
            <ArrowRightIcon class="size-4" />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style>
.circle-enter-active {
  animation: 0.75s circle reverse;
}

.circle-leave-active {
  animation: 0.75s circle;
}

@keyframes circle {
  0% {
    clip-path: circle(75%);
  }

  100% {
    clip-path: circle(0%);
  }
}
</style>
