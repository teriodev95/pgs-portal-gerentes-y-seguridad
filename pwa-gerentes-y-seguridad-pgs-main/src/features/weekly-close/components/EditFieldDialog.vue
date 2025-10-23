<script setup lang="ts">
import { ref } from 'vue'

interface Emit {
  (e: 'action:cancel'): void
  (e: 'update:value'): void
  (e: 'save:value', value: ModalValue): void
}

export type InputType = 'number' | 'text' | undefined
export type ModalValue = number | string | undefined

const props = defineProps<{
  value: ModalValue
  label: string
  type: InputType
}>()

defineEmits<Emit>()

const modalValue = ref<ModalValue>(props.value)
</script>

<template>
  <div
    class="modal-container fixed bottom-0 left-0 z-50 h-full w-full items-end justify-end bg-black bg-opacity-50"
    id="myModal"
  >
    <div
      class="modal-content h-2/7 fixed bottom-0 w-full overflow-hidden rounded bg-white px-6 py-4"
    >
      <!-- Contenido del modal -->
      <div class="mb-4">
        <h2 class="title">{{ label }}</h2>
        <p class="subtitle" v-if="props.type === 'number'">
          Por favor, introduce el monto exacto. Una vez generado el cierre, este no podrá ser
          modificado en el reporte.
        </p>
        <p class="subtitle" v-else-if="type === 'text'">
          Por favor, introduce el texto exacto. Una vez generado el cierre, este no podrá ser
          modificado en el reporte.
        </p>
      </div>

      <div class="space-y-6">
        <div class="flex justify-center">
          <input
            v-if="type === 'number'"
            type="number"
            v-model="modalValue"
            class="w-[60%] border-l-0 border-r-0 border-t-0 border-gray-400 bg-none p-2 text-center text-4xl text-blue-700 outline-none focus:outline-none"
          />

          <textarea
            v-else-if="type === 'text'"
            v-model="modalValue"
            class="w-full resize-none border-l-0 border-r-0 border-t-0 border-gray-400 bg-none p-2 text-center text-4xl text-blue-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div class="space-y-2">
          <button @click="() => $emit('save:value', modalValue)" class="btn-primary w-full">
            Guardar
          </button>
          <button @click="() => $emit('action:cancel')" class="btn-primary-outline w-full">
            Regresar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
  outline: none;
}
</style>
