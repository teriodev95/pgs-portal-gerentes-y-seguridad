<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ApprovalDecision, ApprovalDialogForm, TablaCargosOption } from '../types'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer'
import SlideUnlock from 'vue-slide-unlock'

interface Props {
  isOpen: boolean
  form: ApprovalDialogForm
  roleLabel: string
  tablaCargosOptions: TablaCargosOption[]
  currentPlanId?: number | null
  isLoading?: boolean
}

interface Emits {
  (e: 'update:form', value: ApprovalDialogForm): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const slideUnlockRef = ref()
const slideButtonColor = ref('rgb(29 78 216 / 1)')

const decisionOptions: Array<{ label: string; value: ApprovalDecision }> = [
  { label: 'Aprobar', value: 'aprobado' },
  { label: 'Aprobar con ajuste', value: 'aprobado_con_ajuste' },
  { label: 'Rechazar', value: 'rechazado' }
]

const showsPlanRoute = computed(() => props.form.decision === 'aprobado_con_ajuste')

const selectedPlan = computed(() => {
  const selectedId = Number(props.form.tablaCargosIdSugerido || props.currentPlanId || 0)
  return props.tablaCargosOptions.find((option) => option.id === selectedId) ?? null
})

const selectedLevel = computed({
  get: () => selectedPlan.value?.nivel ?? '',
  set: (nextLevel: string) => {
    const matching = props.tablaCargosOptions.filter((option) => option.nivel === nextLevel)
    const preferred =
      matching.find(
        (option) =>
          option.plazo_semanas === selectedPlan.value?.plazo_semanas &&
          option.monto_solicitado === selectedPlan.value?.monto_solicitado
      ) ?? matching[0]

    if (preferred) {
      updateField('tablaCargosIdSugerido', String(preferred.id))
    }
  }
})

const selectedPlazo = computed({
  get: () => (selectedPlan.value?.plazo_semanas != null ? String(selectedPlan.value.plazo_semanas) : ''),
  set: (nextPlazo: string) => {
    const plazo = Number(nextPlazo)
    const matching = props.tablaCargosOptions.filter(
      (option) => option.nivel === selectedLevel.value && option.plazo_semanas === plazo
    )
    const preferred =
      matching.find((option) => option.monto_solicitado === selectedPlan.value?.monto_solicitado) ?? matching[0]

    if (preferred) {
      updateField('tablaCargosIdSugerido', String(preferred.id))
    }
  }
})

const selectedMonto = computed({
  get: () => (selectedPlan.value?.monto_solicitado != null ? String(selectedPlan.value.monto_solicitado) : ''),
  set: (nextMonto: string) => {
    const monto = Number(nextMonto)
    const preferred = props.tablaCargosOptions.find(
      (option) =>
        option.nivel === selectedLevel.value &&
        option.plazo_semanas === Number(selectedPlazo.value) &&
        option.monto_solicitado === monto
    )

    if (preferred) {
      updateField('tablaCargosIdSugerido', String(preferred.id))
    }
  }
})

const levelOptions = computed(() =>
  Array.from(new Set(props.tablaCargosOptions.map((option) => option.nivel)))
)

const plazoOptions = computed(() => {
  const filtered = props.tablaCargosOptions.filter((option) =>
    selectedLevel.value ? option.nivel === selectedLevel.value : true
  )
  return Array.from(new Set(filtered.map((option) => option.plazo_semanas))).sort((a, b) => a - b)
})

const montoOptions = computed(() => {
  const filtered = props.tablaCargosOptions.filter(
    (option) =>
      (!selectedLevel.value || option.nivel === selectedLevel.value) &&
      (!selectedPlazo.value || option.plazo_semanas === Number(selectedPlazo.value))
  )

  return filtered
    .slice()
    .sort((a, b) => a.monto_solicitado - b.monto_solicitado)
    .map((option) => ({
      id: option.id,
      monto: option.monto_solicitado
    }))
})

const selectedPlanSummary = computed(() => {
  if (!selectedPlan.value) {
    return null
  }

  return {
    etiqueta: `${formatMoney(selectedPlan.value.monto_solicitado)} · ${selectedPlan.value.nivel} · ${selectedPlan.value.plazo_semanas} semanas`,
    tarifa: formatMoney(selectedPlan.value.tarifa_semanal),
    total: formatMoney(selectedPlan.value.total_pagar),
    cargo: formatMoney(selectedPlan.value.cargo)
  }
})

function updateField<Key extends keyof ApprovalDialogForm>(key: Key, value: ApprovalDialogForm[Key]) {
  emit('update:form', {
    ...props.form,
    [key]: value
  })
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(value)
}

function resetSlide() {
  slideUnlockRef.value?.reset()
  slideButtonColor.value = 'rgb(29 78 216 / 1)'
}

function selectDecision(value: ApprovalDecision) {
  updateField('decision', value)
}

defineExpose({ resetSlide })

function selectLevel(value: string) {
  selectedLevel.value = value
}

function selectPlazo(value: number) {
  selectedPlazo.value = String(value)
}

function selectMonto(value: number) {
  selectedMonto.value = String(value)
}
</script>

<template>
  <Drawer :open="isOpen" @update:open="(value: boolean) => value ? null : (!isLoading && $emit('cancel'))">
    <DrawerContent
      class="max-h-[92vh] border-slate-200 bg-white"
    >
      <DrawerHeader class="px-6 pb-4 pt-2 text-left">
        <DrawerTitle class="text-xl font-semibold tracking-tight text-slate-900">
          Aprobación de {{ roleLabel.toLowerCase() }}
        </DrawerTitle>
        <DrawerDescription class="mt-1 text-sm leading-relaxed text-slate-500">
          Registra la decisión y desliza para confirmar. Si hace falta, sugiere un plan alternativo.
        </DrawerDescription>
      </DrawerHeader>

      <div class="flex-1 space-y-6 overflow-y-auto px-6 pb-4 overscroll-contain">
        <section class="grid gap-5 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Decisión
            </label>
            <div class="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
              <button
                v-for="option in decisionOptions"
                :key="option.value"
                type="button"
                class="inline-flex min-h-[48px] items-center justify-center rounded-xl px-4 text-sm font-semibold transition"
                :class="form.decision === option.value
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100'"
                :disabled="isLoading"
                @click="selectDecision(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div v-if="showsPlanRoute" class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Ruta del plan sugerido
            </label>
            <div class="grid gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4">
              <div class="space-y-3">
                <div class="space-y-2">
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Nivel</span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="option in levelOptions"
                      :key="option"
                      type="button"
                      class="inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-medium transition"
                      :class="selectedLevel === option
                        ? 'border-blue-700 bg-blue-700 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'"
                      :disabled="isLoading"
                      @click="selectLevel(option)"
                    >
                      {{ option }}
                    </button>
                  </div>
                </div>

                <div class="space-y-2">
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Plazo</span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="option in plazoOptions"
                      :key="option"
                      type="button"
                      class="inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-medium transition"
                      :class="selectedPlazo === String(option)
                        ? 'border-blue-700 bg-blue-700 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'"
                      :disabled="isLoading || !selectedLevel"
                      @click="selectPlazo(option)"
                    >
                      {{ option }} semanas
                    </button>
                  </div>
                </div>

                <div class="space-y-2">
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Monto</span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="option in montoOptions"
                      :key="option.id"
                      type="button"
                      class="inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-medium transition"
                      :class="selectedMonto === String(option.monto)
                        ? 'border-blue-700 bg-blue-700 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'"
                      :disabled="isLoading || !selectedPlazo"
                      @click="selectMonto(option.monto)"
                    >
                      {{ formatMoney(option.monto) }}
                    </button>
                  </div>
                </div>
              </div>

              <div
                v-if="selectedPlanSummary"
                class="grid gap-3 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700 md:grid-cols-4"
              >
                <div class="md:col-span-4">
                  <p class="font-semibold text-slate-900">{{ selectedPlanSummary.etiqueta }}</p>
                </div>
                <p><span class="font-medium text-slate-500">Tarifa:</span> {{ selectedPlanSummary.tarifa }}</p>
                <p><span class="font-medium text-slate-500">Cargo:</span> {{ selectedPlanSummary.cargo }}</p>
                <p><span class="font-medium text-slate-500">Total:</span> {{ selectedPlanSummary.total }}</p>
                <p><span class="font-medium text-slate-500">ID:</span> {{ form.tablaCargosIdSugerido || '-' }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="space-y-2">
          <label class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Comentario
          </label>
          <textarea
            :value="form.comentario"
            rows="4"
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-900 outline-none transition focus:border-blue-700"
            :disabled="isLoading"
            placeholder="Resume la razón de tu decisión."
            @input="updateField('comentario', ($event.target as HTMLTextAreaElement).value)"
          />
        </section>

      </div>

      <DrawerFooter class="gap-2 border-t border-slate-200 bg-white px-6 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4">
        <div class="rounded-full border border-slate-200 bg-slate-50 p-1">
          <slide-unlock
            ref="slideUnlockRef"
            :auto-width="true"
            :circle="true"
            :disabled="isLoading"
            :noanimate="false"
            :text="isLoading ? 'Guardando...' : 'Desliza para confirmar'"
            success-text="Confirmado"
            name="solim-approval"
            :style="{
              '--su-color-text-normal': 'white',
              '--su-color-bg': slideButtonColor,
              '--su-color-progress-normal-bg': 'rgb(14 159 110 / 1)',
              '--su-color-progress-complete-bg': 'rgb(14 159 110 / 1)',
              '--su-size-padding': '0'
            }"
            @completed="() => { slideButtonColor = 'rgb(14 159 110 / 1)'; $emit('confirm') }"
          />
        </div>
        <button
          class="inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-slate-500 transition hover:text-slate-700"
          :disabled="isLoading"
          @click="$emit('cancel')"
        >
          Cancelar
        </button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
