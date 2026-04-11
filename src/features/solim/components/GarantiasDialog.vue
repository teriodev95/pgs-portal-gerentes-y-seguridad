<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ShieldCheck, XCircle, X, ChevronDown, Home, Car } from 'lucide-vue-next'
import type { ActivosData, ActivosElectrodomestico, RevisionApproval } from '../types'

interface Props {
  isOpen: boolean
  clienteActivos: ActivosData | null
  avalActivos: ActivosData | null
  currentApproval: RevisionApproval | null
  isLoading?: boolean
}

interface Emits {
  (e: 'confirm', payload: { decision: 'aprobado' | 'rechazado'; comentario: string }): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const decision = ref<'aprobar' | 'rechazar'>('aprobar')
const comentario = ref('')
const showClienteInfo = ref(false)
const showAvalInfo = ref(false)

const clienteFotos = computed(() =>
  (props.clienteActivos?.fotos_urls ?? []).filter((url) => url && url.trim() !== '')
)
const avalFotos = computed(() =>
  (props.avalActivos?.fotos_urls ?? []).filter((url) => url && url.trim() !== '')
)

const canConfirm = computed(() => {
  if (props.isLoading) return false
  if (decision.value === 'rechazar' && !comentario.value.trim()) return false
  return true
})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      const d = props.currentApproval?.decision
      decision.value = d === 'rechazado' ? 'rechazar' : 'aprobar'
      comentario.value = props.currentApproval?.comentario ?? ''
      showClienteInfo.value = false
      showAvalInfo.value = false
    }
  }
)

function handleConfirm() {
  if (!canConfirm.value) return
  emit('confirm', {
    decision: decision.value === 'aprobar' ? 'aprobado' : 'rechazado',
    comentario: comentario.value.trim()
  })
}

function handleCancel() {
  if (!props.isLoading) {
    emit('cancel')
  }
}

const ELECTRODOMESTICO_LABELS: Record<string, string> = {
  refrigerador: 'Refrigerador',
  horno_microondas: 'Horno microondas',
  lavadora_ropa: 'Lavadora',
  secadora_ropa: 'Secadora',
  pantalla_tv: 'Pantalla/TV',
  mini_componente: 'Minicomponente',
  computadora: 'Computadora',
  consola_videojuegos: 'Consola videojuegos'
}

function formatActivosInfo(activos: ActivosData | null) {
  if (!activos) return []
  const items: { label: string; value: string }[] = []
  if (activos.vivienda_tipo) items.push({ label: 'Vivienda', value: activos.vivienda_tipo })
  if (activos.vivienda_pisos) items.push({ label: 'Pisos', value: activos.vivienda_pisos })
  if (activos.vivienda_color) items.push({ label: 'Color vivienda', value: activos.vivienda_color })
  if (activos.vehiculo?.tiene) {
    const v = activos.vehiculo
    const desc = [v.marca, v.modelo, v.color, v.placas].filter(Boolean).join(' · ')
    items.push({ label: 'Vehículo', value: desc || 'Registrado' })
  }
  for (const [key, label] of Object.entries(ELECTRODOMESTICO_LABELS)) {
    const raw = activos[key as keyof ActivosData]
    if (raw && typeof raw === 'object' && 'marca' in raw) {
      const elec = raw as ActivosElectrodomestico
      if (elec.marca || elec.valor) {
        const parts: string[] = []
        if (elec.marca) parts.push(String(elec.marca))
        if (elec.valor) parts.push(`$${Number(elec.valor).toLocaleString('es-MX')}`)
        items.push({ label, value: parts.join(' · ') })
      }
    }
  }
  if (activos.otros) items.push({ label: 'Otros', value: activos.otros })
  return items
}
</script>

<template>
  <Teleport to="body">
    <Transition name="garantias-overlay">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-black/40"
        @click.self="handleCancel"
      />
    </Transition>

    <Transition name="garantias-panel">
      <div
        v-if="isOpen"
        class="fixed inset-x-0 bottom-0 z-50"
      >
        <div
          class="relative w-full rounded-t-3xl border border-b-0 border-slate-200 bg-white shadow-[0_-8px_40px_-12px_rgba(15,23,42,0.25)]"
        >
          <!-- Scroll container -->
          <div class="max-h-[85vh] overflow-y-auto overscroll-contain px-5 pb-6 pt-6">
            <!-- Header -->
            <div class="mb-5 pr-8">
              <h2 class="text-lg font-semibold text-slate-900">
                Validación de garantías
              </h2>
              <p class="mt-1 text-sm text-slate-500">
                Revisa los activos y fotos, luego confirma si son válidos.
              </p>
            </div>

            <!-- Close button -->
            <button
              class="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              :disabled="isLoading"
              @click="handleCancel"
            >
              <X :size="18" />
            </button>

            <!-- CLIENTE -->
            <section class="mb-4">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left transition hover:bg-slate-100"
                @click="showClienteInfo = !showClienteInfo"
              >
                <div class="flex items-center gap-2">
                  <Home class="size-4 text-slate-500" />
                  <span class="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Activos cliente</span>
                  <span class="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{{ clienteFotos.length }} foto{{ clienteFotos.length !== 1 ? 's' : '' }}</span>
                </div>
                <ChevronDown class="size-4 text-slate-400 transition-transform" :class="{ 'rotate-180': showClienteInfo }" />
              </button>

              <div v-if="showClienteInfo" class="mt-2 space-y-2">
                <!-- Info activos cliente -->
                <div v-if="formatActivosInfo(clienteActivos).length" class="space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
                  <div v-for="item in formatActivosInfo(clienteActivos)" :key="item.label" class="flex items-center justify-between text-xs">
                    <span class="text-slate-500">{{ item.label }}</span>
                    <span class="font-medium text-slate-700">{{ item.value }}</span>
                  </div>
                </div>
                <!-- Fotos cliente -->
                <div v-if="clienteFotos.length" class="grid grid-cols-3 gap-2">
                  <a
                    v-for="(url, idx) in clienteFotos"
                    :key="idx"
                    :href="url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block overflow-hidden rounded-xl"
                  >
                    <img :src="url" :alt="`Cliente ${idx + 1}`" class="aspect-square w-full object-cover transition hover:scale-105" />
                  </a>
                </div>
                <p v-else class="text-xs text-slate-400">Sin fotos registradas</p>
              </div>
            </section>

            <!-- AVAL -->
            <section class="mb-5">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left transition hover:bg-slate-100"
                @click="showAvalInfo = !showAvalInfo"
              >
                <div class="flex items-center gap-2">
                  <Car class="size-4 text-slate-500" />
                  <span class="text-[12px] font-semibold uppercase tracking-wide text-slate-600">Activos aval</span>
                  <span class="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{{ avalFotos.length }} foto{{ avalFotos.length !== 1 ? 's' : '' }}</span>
                </div>
                <ChevronDown class="size-4 text-slate-400 transition-transform" :class="{ 'rotate-180': showAvalInfo }" />
              </button>

              <div v-if="showAvalInfo" class="mt-2 space-y-2">
                <!-- Info activos aval -->
                <div v-if="formatActivosInfo(avalActivos).length" class="space-y-1 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
                  <div v-for="item in formatActivosInfo(avalActivos)" :key="item.label" class="flex items-center justify-between text-xs">
                    <span class="text-slate-500">{{ item.label }}</span>
                    <span class="font-medium text-slate-700">{{ item.value }}</span>
                  </div>
                </div>
                <!-- Fotos aval -->
                <div v-if="avalFotos.length" class="grid grid-cols-3 gap-2">
                  <a
                    v-for="(url, idx) in avalFotos"
                    :key="idx"
                    :href="url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block overflow-hidden rounded-xl"
                  >
                    <img :src="url" :alt="`Aval ${idx + 1}`" class="aspect-square w-full object-cover transition hover:scale-105" />
                  </a>
                </div>
                <p v-else class="text-xs text-slate-400">Sin fotos registradas</p>
              </div>
            </section>

            <!-- Decision buttons -->
            <section class="mb-4">
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition"
                  :class="
                    decision === 'aprobar'
                      ? 'border-2 border-emerald-500 bg-emerald-100 text-emerald-800'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  "
                  :disabled="isLoading"
                  @click="decision = 'aprobar'"
                >
                  <ShieldCheck :size="18" />
                  Aprobar
                </button>

                <button
                  type="button"
                  class="flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition"
                  :class="
                    decision === 'rechazar'
                      ? 'border-2 border-red-500 bg-red-100 text-red-800'
                      : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                  "
                  :disabled="isLoading"
                  @click="decision = 'rechazar'"
                >
                  <XCircle :size="18" />
                  Rechazar
                </button>
              </div>
            </section>

            <!-- Comment -->
            <section class="mb-5">
              <textarea
                v-model="comentario"
                rows="2"
                class="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                :disabled="isLoading"
                placeholder="Agrega un comentario (obligatorio si rechazas)."
              />
            </section>

            <!-- Confirm button -->
            <button
              type="button"
              class="h-12 w-full rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
              :class="
                decision === 'aprobar'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              "
              :disabled="!canConfirm"
              @click="handleConfirm"
            >
              {{ isLoading ? 'Guardando...' : 'Confirmar validación' }}
            </button>

            <!-- Cancel button -->
            <button
              type="button"
              class="mt-2 w-full py-2 text-sm text-slate-500 transition hover:text-slate-700"
              :disabled="isLoading"
              @click="handleCancel"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.garantias-overlay-enter-active,
.garantias-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.garantias-overlay-enter-from,
.garantias-overlay-leave-to {
  opacity: 0;
}

.garantias-panel-enter-active,
.garantias-panel-leave-active {
  transition: transform 0.3s ease;
}
.garantias-panel-enter-from,
.garantias-panel-leave-to {
  transform: translateY(100%);
}
</style>
