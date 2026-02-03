<script setup lang="ts">
import { computed } from 'vue'
import { toCurrency } from '@/shared/utils';
import type { INewAssignment } from '@/features/assignment/types';

// Components
import ArrowDown from '@/shared/components/icons/ArrowDown.vue';
import ArrowRight from '@/shared/components/icons/ArrowRight.vue';
import ArrowUp from '@/shared/components/icons/ArrowUp.vue';
import CardContainer from '@/shared/components/CardContainer.vue';
import InfoIcon from '@/shared/components/icons/InfoIcon.vue';
import KeyOutline from '@/shared/components/icons/KeyOutline.vue';
import ToolsIcon from '@/shared/components/icons/ToolsIcon.vue';
import TextCT from '@/shared/components/ui/TextCT.vue';

// Interface - Props - Emits
interface Emits {
  (event: 'action:correction-request', assignment: INewAssignment): void;
}

export interface Props {
  assignment: INewAssignment
  icon?: 'expense' | 'income'
  type: 'agency' | 'management'
}

const $props = defineProps<Props>()
defineEmits<Emits>();

// State definitions
const showAgency = computed(() => $props.assignment.tipo === 'Agente')
</script>

<template>
  <CardContainer>
    <div class="flex justify-between items-center">
      <TextCT as="h3" variant="title">Asignación ({{ assignment.tipo }})</TextCT>

      <template v-if="icon">
        <ArrowUp v-if="icon === 'expense'" class="h-6 w-6 text-red-500" />
        <ArrowDown v-else class="h-6 w-6 text-green-500" />
      </template>
    </div>

    <template v-if="type === 'management'">
      <div class="flex items-center gap-1">
        <TextCT variant="tertiary" as="span">{{ assignment.usuarioEntrego.tipo }} {{ showAgency ? `(${assignment.agencia})` : '' }}</TextCT>
        <ArrowRight class="inline-block size-2 " />
        <TextCT variant="tertiary" as="span">{{ assignment.usuarioRecibio.tipo }}</TextCT>
      </div>
    </template>

    <div class="flex items-center justify-between gap-2">
      <div class="rounded-full bg-slate-100 px-2 py-1 ">
        <TextCT variant="secondary" as="span">{{ assignment.createdAt }}</TextCT>
      </div>

      <div class="rounded-full bg-slate-100 px-2 py-1 ">
        <TextCT variant="secondary" as="span">{{ toCurrency(assignment.monto) }}</TextCT>
      </div>
    </div>

    <div class="flex items-center justify-end">
      <button @click="$emit('action:correction-request', assignment)"
        class="btn rounded-lg border border-blue-700 p-1 text-center text-sm font-medium text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 flex items-center justify-center gap-2">
        <ToolsIcon class="size-5" />
        Solicitar corrección
      </button>
    </div>

    <hr class="line-sm" />

    <div class="space-y-1">
      <template v-if="type === 'agency'">
        <div class="gap-0.5">
          <InfoIcon class="inline-block h-[1rem] w-[1rem]" />
          <TextCT variant="tertiary" as="span">
            Asignación recibida por {{ assignment.usuarioRecibio.usuario }} [{{ assignment.usuarioRecibio.tipo }}] en
            semana {{ assignment.semana }}
          </TextCT>
        </div>
      </template>

      <template v-else>
        <div class="flex items-center gap-2">
          <p class="text-xs font-light space-x-0.5 text-purple-700">
            <ArrowUp class="inline-block size-4" />
            <span class="font-semibold">Entregó</span> {{ assignment.usuarioEntrego.nombre }}
          </p>

          <p class="text-xs font-light space-x-0.5 text-blue-700">
            <ArrowDown class="inline-block size-4" />
            <span class="font-semibold">Recibió</span> {{ assignment.usuarioRecibio.nombre }}
          </p>
        </div>
      </template>

      <div class="space-x-0.5">
        <KeyOutline class="inline-block h-[1rem] w-[1rem] text-gray-400" />
        <TextCT variant="tertiary" as="span">{{ assignment.id }}</TextCT>
      </div>
    </div>
  </CardContainer>
</template>