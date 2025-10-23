<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'VideoPlayer'
})

defineProps<{
  showLiveVideo: boolean
  showRecordedVideo: boolean
  isCameraOpen: boolean
  verificationMessage: string
}>()

const videoLive = ref<HTMLVideoElement>()
const videoRecorded = ref<HTMLVideoElement>()

defineExpose({
  videoLive,
  videoRecorded
})
</script>

<template>
  <div>
    <!-- LIVE VIDEO -->
    <div v-show="showLiveVideo" class="relative">
      <div
        class="absolute z-10 border-2 border-blue-700 text-blue-900 text-sm rounded-2xl px-2 py-1.5 top-5 bg-blue-100 left-[50%] -translate-x-[50%]"
      >
        {{ verificationMessage }}
      </div>

      <video
        ref="videoLive"
        autoplay
        muted
        playsinline
        class="border rounded-2xl w-full"
        :class="[!isCameraOpen ? 'h-60 bgImageVideo' : 'h-auto bg-black']"
      ></video>
    </div>

    <!-- RECORDED VIDEO -->
    <div v-show="showRecordedVideo">
      <video
        ref="videoRecorded"
        controls
        playsinline
        class="border rounded-2xl w-full"
      ></video>
    </div>
  </div>
</template>

<style scoped>
.bgImageVideo {
  background-image: url('/exampleVideo.png');
  background-size: cover;
  background-position: center;
}
</style>