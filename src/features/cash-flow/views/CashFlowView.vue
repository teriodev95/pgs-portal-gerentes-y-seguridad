<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import { useCashFlow } from '../composables/useCashFlow'
import { useCountUp } from '../composables/useCountUp'

const router = useRouter()

const {
  resumen,
  loading,
  gerenciaSelected,
  currentDate,
  ingresos,
  egresos,
  enCampo,
} = useCashFlow()

const animIngresos = useCountUp(computed(() => resumen.value.total_ingresos))
const animEgresos = useCountUp(computed(() => resumen.value.total_egresos))
const animEnCampo = useCountUp(computed(() => resumen.value.total_en_campo))
const animBalance = useCountUp(computed(() => resumen.value.balance))

function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}
</script>

<template>
  <MainCT>
    <NavbarCT
      title="Flujo de Efectivo"
      :subtitles="[
        gerenciaSelected?.toUpperCase() ?? '',
        `Semana ${currentDate.week} · ${currentDate.year}`,
      ]"
      show-back-button
      @back="router.back()"
    />

    <div class="px-4 pb-6 pt-2 space-y-4">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-3">
        <div class="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <span class="text-xs text-slate-400 font-medium">Cargando movimientos...</span>
      </div>

      <template v-else>
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 gap-3">
          <div class="fade-in bg-white rounded-2xl p-4 shadow-sm border border-slate-100" style="animation-delay: 0ms">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-2 h-2 rounded-full bg-emerald-500" />
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Ingresos</span>
            </div>
            <p class="text-lg font-bold text-slate-800 tabular-nums">{{ formatMoney(animIngresos) }}</p>
          </div>

          <div class="fade-in bg-white rounded-2xl p-4 shadow-sm border border-slate-100" style="animation-delay: 60ms">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-2 h-2 rounded-full bg-red-500" />
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Egresos</span>
            </div>
            <p class="text-lg font-bold text-slate-800 tabular-nums">{{ formatMoney(animEgresos) }}</p>
          </div>

          <div class="fade-in bg-white rounded-2xl p-4 shadow-sm border border-slate-100" style="animation-delay: 120ms">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-2 h-2 rounded-full bg-amber-500" />
              <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">En Campo</span>
            </div>
            <p class="text-lg font-bold text-slate-800 tabular-nums">{{ formatMoney(animEnCampo) }}</p>
          </div>

          <div class="fade-in rounded-2xl p-4 shadow-sm border" style="animation-delay: 180ms"
            :class="resumen.balance >= 0
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'"
          >
            <div class="flex items-center gap-2 mb-1">
              <div class="w-2 h-2 rounded-full" :class="resumen.balance >= 0 ? 'bg-emerald-600' : 'bg-red-600'" />
              <span class="text-[11px] font-medium uppercase tracking-wider"
                :class="resumen.balance >= 0 ? 'text-emerald-600' : 'text-red-600'"
              >Balance</span>
            </div>
            <p class="text-lg font-bold tabular-nums"
              :class="resumen.balance >= 0 ? 'text-emerald-700' : 'text-red-700'"
            >{{ formatMoney(animBalance) }}</p>
          </div>
        </div>

        <!-- Ingresos -->
        <div class="fade-in bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" style="animation-delay: 250ms">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 rounded-full bg-emerald-500" />
              <h3 class="text-sm font-bold text-slate-700">Ingresos</h3>
            </div>
            <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {{ ingresos.length }}
            </span>
          </div>
          <div class="divide-y divide-slate-100/70">
            <div
              v-for="(item, i) in ingresos"
              :key="i"
              class="px-4 py-3 flex items-center justify-between gap-4"
            >
              <p class="text-xs text-slate-600 min-w-0 flex-1 leading-relaxed">{{ item.concepto }}</p>
              <span class="text-xs font-bold text-emerald-600 tabular-nums shrink-0">
                {{ formatMoney(item.monto) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Egresos -->
        <div class="fade-in bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" style="animation-delay: 320ms">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 rounded-full bg-red-500" />
              <h3 class="text-sm font-bold text-slate-700">Egresos</h3>
            </div>
            <span class="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              {{ egresos.length }}
            </span>
          </div>
          <div class="divide-y divide-slate-100/70">
            <div
              v-for="(item, i) in egresos"
              :key="i"
              class="px-4 py-3 flex items-center justify-between gap-4"
            >
              <p class="text-xs text-slate-600 min-w-0 flex-1 leading-relaxed">{{ item.concepto }}</p>
              <span class="text-xs font-bold text-red-600 tabular-nums shrink-0">
                {{ formatMoney(item.monto) }}
              </span>
            </div>
          </div>
        </div>

        <!-- En Campo -->
        <div class="fade-in bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" style="animation-delay: 390ms">
          <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 rounded-full bg-amber-500" />
              <h3 class="text-sm font-bold text-slate-700">En Campo</h3>
            </div>
            <span class="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {{ enCampo.length }}
            </span>
          </div>
          <div class="divide-y divide-slate-100/70">
            <div
              v-for="(item, i) in enCampo"
              :key="i"
              class="px-4 py-3 flex items-center justify-between gap-4"
            >
              <p class="text-xs text-slate-600 min-w-0 flex-1 leading-relaxed">{{ item.concepto }}</p>
              <span class="text-xs font-bold text-amber-600 tabular-nums shrink-0">
                {{ formatMoney(item.monto) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </MainCT>
</template>

<style scoped>
.fade-in {
  animation: fadeInUp 0.4s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
