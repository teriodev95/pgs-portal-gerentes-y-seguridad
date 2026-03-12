<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ApprovalDecision, ApprovalDialogForm, TablaCargosOption } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
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
const slideButtonColor = ref('rgb(15 75 103 / 1)')

const decisionOptions: Array<{ label: string; value: ApprovalDecision }> = [
  { label: 'Aprobar', value: 'aprobado' },
  { label: 'Aprobar con ajuste', value: 'aprobado_con_ajuste' },
  { label: 'Rechazar', value: 'rechazado' }
]

const isAdjustmentDecision = computed(() => props.form.decision === 'aprobado_con_ajuste')
const showsPlanRoute = computed(() => props.form.decision !== 'rechazado')

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
  slideButtonColor.value = 'rgb(15 75 103 / 1)'
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
  <Dialog :open="isOpen" @update:open="(value) => value ? null : (!isLoading && $emit('cancel'))">
    <DialogContent
      class="max-w-2xl overflow-hidden rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#fcfdff_0%,#f7f9fc_100%)] p-0 shadow-[0_28px_100px_-52px_rgba(15,23,42,0.5)]"
      :disable-outside-pointer-events="isLoading"
    >
      <DialogHeader>
        <div class="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#0f4a67_0%,#0d3c55_100%)] px-7 pb-7 pt-8 text-white">
          <div class="absolute inset-x-0 bottom-0 h-16 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_62%)]" />
          <DialogTitle class="relative text-[2rem] font-semibold tracking-[-0.03em]">
            Aprobación de {{ roleLabel.toLowerCase() }}
          </DialogTitle>
          <DialogDescription class="relative mt-3 max-w-xl text-[15px] leading-relaxed text-slate-100/78">
            Registra la decisión y desliza para confirmar. Si hace falta, sugiere un plan alternativo.
          </DialogDescription>
        </div>
      </DialogHeader>

      <div class="max-h-[78vh] space-y-7 overflow-y-auto px-7 py-7 overscroll-contain">
        <section class="grid gap-5 md:grid-cols-2">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Decisión
            </label>
            <div class="grid gap-2 rounded-[24px] border border-slate-200 bg-white/80 p-2">
              <button
                v-for="option in decisionOptions"
                :key="option.value"
                type="button"
                class="inline-flex min-h-[50px] items-center justify-center rounded-[18px] px-4 text-sm font-semibold transition"
                :class="form.decision === option.value
                  ? 'bg-slate-900 text-white shadow-[0_14px_30px_-20px_rgba(15,23,42,0.7)]'
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
            <div class="grid gap-3 rounded-[24px] border border-slate-200 bg-white/80 p-4">
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
                        ? 'border-slate-900 bg-slate-900 text-white'
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
                        ? 'border-slate-900 bg-slate-900 text-white'
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
                        ? 'border-slate-900 bg-slate-900 text-white'
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
                class="grid gap-3 rounded-[20px] bg-slate-50 px-4 py-4 text-sm text-slate-700 md:grid-cols-4"
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
          <label class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Comentario
          </label>
          <textarea
            :value="form.comentario"
            rows="4"
            class="w-full rounded-[24px] border border-slate-300 bg-white px-5 py-4 text-[15px] leading-relaxed text-slate-900 outline-none transition focus:border-slate-900"
            :disabled="isLoading"
            placeholder="Resume la razón de tu decisión."
            @input="updateField('comentario', ($event.target as HTMLTextAreaElement).value)"
          />
        </section>

        <section
          v-if="isAdjustmentDecision"
          class="space-y-4 rounded-[28px] border border-amber-200 bg-[linear-gradient(180deg,#fff7ed_0%,#fff3e0_100%)] px-6 py-6"
        >
          <div>
            <p class="text-sm font-semibold text-amber-950">Ajuste del plan</p>
            <p class="mt-1 text-sm text-amber-900/80">
              Usa estos campos solo cuando la aprobación no siga exactamente el plan solicitado.
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <label class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                Monto autorizado
              </label>
              <input
                :value="form.montoAutorizado"
                type="number"
                inputmode="decimal"
                class="h-[52px] w-full rounded-[20px] border border-amber-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-amber-500"
                :disabled="isLoading"
                @input="updateField('montoAutorizado', ($event.target as HTMLInputElement).value)"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                Incremento autorizado
              </label>
              <input
                :value="form.incrementoAutorizado"
                type="number"
                inputmode="decimal"
                class="h-[52px] w-full rounded-[20px] border border-amber-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-amber-500"
                :disabled="isLoading"
                @input="updateField('incrementoAutorizado', ($event.target as HTMLInputElement).value)"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                Nivel autorizado
              </label>
              <input
                :value="form.nivelAutorizado"
                type="text"
                class="h-[52px] w-full rounded-[20px] border border-amber-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-amber-500"
                :disabled="isLoading"
                @input="updateField('nivelAutorizado', ($event.target as HTMLInputElement).value)"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                Plazo autorizado
              </label>
              <input
                :value="form.plazoAutorizado"
                type="number"
                inputmode="numeric"
                class="h-[52px] w-full rounded-[20px] border border-amber-300 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-amber-500"
                :disabled="isLoading"
                @input="updateField('plazoAutorizado', ($event.target as HTMLInputElement).value)"
              />
            </div>
          </div>
        </section>

        <div class="space-y-3 border-t border-slate-200 pt-6">
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
          <button
            class="inline-flex h-10 w-full items-center justify-center rounded-[18px] text-sm font-medium text-slate-500 transition hover:text-slate-700"
            :disabled="isLoading"
            @click="$emit('cancel')"
          >
            Cancelar
          </button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
