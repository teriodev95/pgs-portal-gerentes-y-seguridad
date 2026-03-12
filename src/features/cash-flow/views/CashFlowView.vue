<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import SummaryCard from '../components/SummaryCard.vue'
import MovementsList from '../components/MovementsList.vue'
import { useCashFlow, useCashFlowFormatters, useCountUp } from '../composables'

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

const { formatMoney } = useCashFlowFormatters()

const animIngresos = useCountUp(computed(() => resumen.value.total_ingresos))
const animEgresos = useCountUp(computed(() => resumen.value.total_egresos))
const animEnCampo = useCountUp(computed(() => resumen.value.total_en_campo))
const animBalance = useCountUp(computed(() => resumen.value.balance))
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
          <SummaryCard
            label="Ingresos"
            :value="formatMoney(animIngresos)"
            variant="ingreso"
            :animation-delay="0"
          />

          <SummaryCard
            label="Egresos"
            :value="formatMoney(animEgresos)"
            variant="egreso"
            :animation-delay="60"
          />

          <SummaryCard
            label="En Campo"
            :value="formatMoney(animEnCampo)"
            variant="enCampo"
            :animation-delay="120"
          />

          <SummaryCard
            label="Balance"
            :value="formatMoney(animBalance)"
            variant="balance"
            :balance="resumen.balance"
            :animation-delay="180"
          />
        </div>

        <!-- Movements Lists -->
        <MovementsList
          title="Ingresos"
          :movements="ingresos"
          variant="ingreso"
          :animation-delay="250"
          :format-money="formatMoney"
        />

        <MovementsList
          title="Egresos"
          :movements="egresos"
          variant="egreso"
          :animation-delay="320"
          :format-money="formatMoney"
        />

        <MovementsList
          title="En Campo"
          :movements="enCampo"
          variant="enCampo"
          :animation-delay="390"
          :format-money="formatMoney"
        />
      </template>
    </div>
  </MainCT>
</template>

