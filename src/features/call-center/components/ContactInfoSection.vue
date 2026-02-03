<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IQuestion } from '@/features/call-center/types'

// Components
import PhoneIcon from '@/shared/components/icons/PhoneIcon.vue'
import HeadphonesIcon from '@/shared/components/icons/HeadPhonesIcon.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import DataField from '@/shared/components/DataField.vue'
import CardContainer from '@/shared/components/CardContainer.vue'

/**
 * ------------------------------------------
 *	Types
 * ------------------------------------------
 */
export interface ContactInfo {
  label: string // "Cliente" o "Aval"
  name: string
  attendedBy: string | null
  numCalls: number
  callUrl: string | null
  observations: string | null
  questions: IQuestion[]
  callStatus: string
}

interface Props {
  contact: ContactInfo
  showTopDivider?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTopDivider: false
})

/**
 * ------------------------------------------
 *	State
 * ------------------------------------------
 */
const selectedQuestion = ref<IQuestion>()
const isObservationsVisible = ref<boolean>(false)

/**
 * ------------------------------------------
 *	Computed
 * ------------------------------------------
 */
const isQuestionSelected = computed(() => selectedQuestion.value !== undefined)
const hasAnsweredCall = computed(() => props.contact.callStatus === 'Contestado')

/**
 * ------------------------------------------
 *	Methods
 * ------------------------------------------
 */

/**
 * selectQuestion
 * @param question
 */
function selectQuestion(question: IQuestion | undefined): void {
  selectedQuestion.value = question
}

/**
 * toggleObservations
 */
function toggleObservations(): void {
  isObservationsVisible.value = !isObservationsVisible.value
}

/**
 * reset - Expose reset method for parent component
 */
function reset(): void {
  isObservationsVisible.value = false
  selectedQuestion.value = undefined
}

defineExpose({ reset })
</script>

<template>
  <div class="space-y-4 flex-1">
    <hr v-if="showTopDivider" class="line" />

    <!-- Person Details -->
    <div>
      <DataField :label="contact.label" :value="contact.name" />
      <DataField label="Atendió" :value="contact.attendedBy || 'Nadie'" />
    </div>

    <!-- Call Stats & Recording -->
    <div class="flex justify-end gap-4">
      <kbd
        class="flex items-center gap-1 rounded border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800">
        <PhoneIcon class="h-4 w-4" />
        <span>{{ contact.numCalls }}</span>
      </kbd>

      <a v-if="contact.callUrl" :href="contact.callUrl" target="_blank"
        class="me-2 flex items-center gap-1 rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
        <HeadphonesIcon class="h-4 w-4" /> Escuchar
      </a>
    </div>

    <!-- Observations -->
    <CardContainer v-if="!isObservationsVisible" @click="toggleObservations">
      <TextCT variant="primary" class="text-center">Observaciones</TextCT>
    </CardContainer>

    <CardContainer v-else @click="toggleObservations">
      <TextCT variant="secondary" :class="{ 'text-center': !contact.observations }">
        {{ contact.observations || 'No se han registrado observaciones' }}
      </TextCT>
    </CardContainer>

    <!-- Question Details (when one is selected) -->
    <div v-if="isQuestionSelected" @click="selectQuestion(undefined)"
      class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white px-5 py-2 shadow">
      <TextCT variant="primary">{{ selectedQuestion?.pregunta }}</TextCT>
      <TextCT variant="secondary">R= {{ selectedQuestion?.respuesta }}</TextCT>
    </div>

    <!-- Questions Grid -->
    <div v-else-if="hasAnsweredCall" class="grid grid-cols-5 gap-2">
      <div v-for="(question, index) in contact.questions" :key="`question-${contact.label}-${index}`"
        @click="selectQuestion(question)"
        class="flex h-16 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white shadow">
        <TextCT variant="tertiary">{{ `P${index + 1}` }}</TextCT>
      </div>
    </div>
  </div>
</template>
