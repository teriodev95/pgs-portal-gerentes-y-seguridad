<script setup lang="ts">
import { ref } from 'vue'
import { useRevealCircleStore } from '@/shared/stores/revealCircle'

/**
 * ------------------------------------------
 *	Components
 * ------------------------------------------
 */

import IconCheck from '@/shared/components/icons/CheckIcon.vue'
import ArrowRightIcon from '@/shared/components/icons/ArrowRightIcon.vue'

/**
 * ------------------------------------------
 *	Store
 * ------------------------------------------
 */

const revealCircleStore = useRevealCircleStore()

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
  revealCircleStore.hideRevealCircle()
}
</script>

<template>
  <transition name="circle">
    <div v-if="revealCircleStore.isVisible" class="absolute bottom-0 left-0 right-0 top-0 z-50 bg-black bg-opacity-60">
      <div class="h-full flex flex-col justify-center items-center " :class="colorPalette[revealCircleStore.type].bg">

        <div>
          <IconCheck :class="colorPalette[revealCircleStore.type].icon" class="h-24 w-24 rounded-full border-8 p-6 text-white" />
        </div>

        <div class="space-y-8 p-4 text-white ">
          <div class="space-y-4 p-4 text-center">
            <h2 class="text-2xl font-bold">{{ revealCircleStore.mainText }}</h2>
            <p v-html="revealCircleStore.secondaryText"></p>


            <div class="space-y-2">
              <p v-if="revealCircleStore.subText" class="font-semibold">{{ revealCircleStore.subText }}</p>
              <template v-if="revealCircleStore.list">
                <p class="text-center" v-for="item in revealCircleStore.list" :key="item" v-html="item"></p>
              </template>
            </div>

          </div>

          <button class="w-full btn btn-white-outline flex gap-4 items-center justify-center"
            @click="handleClickTransition">
            {{ revealCircleStore.ctaText || 'Continuar' }}
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
