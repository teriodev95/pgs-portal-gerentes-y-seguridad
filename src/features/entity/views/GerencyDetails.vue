<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'

// Components
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import ManagementInformation from '@/features/entity/components/ManagementInformation.vue'

// Composables
import { useGerencyDetails } from '@/features/entity/composables/useGerencyDetails'
import { useStore } from '@/shared/stores'
import { commonService } from '@/shared/services/modules'

const router = useRouter()
const { dashboardData, management, managementDebts, isLoading } = useGerencyDetails()

// Computed
// El titulo es el identificador y nada mas. Con "Gerencia" delante, en telefono
// se truncaba justo el dato que da nombre a la pantalla -"Gerencia GERE0..."-,
// y la palabra ya la dice el contexto: se llega aqui desde el chip de gerencias.
const navbarTitle = computed(() => management.value || 'Gerencia')

// Estado del cierre de la semana. Mismo dato que la palomita del riel, aqui con
// la fecha: en la ficha hay espacio para decir cuando se firmo, y es lo que
// oficina pregunta.
const $store = useStore()
const cierre = ref<{ cerrada: boolean; cerradoEn: string | null } | null>(null)

const cierreTexto = computed(() => {
  if (!cierre.value?.cerrada) return null
  if (!cierre.value.cerradoEn) return 'Cerrada'

  const d = new Date(cierre.value.cerradoEn)
  if (Number.isNaN(d.getTime())) return 'Cerrada'

  // La fecha viaja en UTC; se muestra en hora de Mexico, que es la que el
  // usuario reconoce.
  return `Cerrada ${new Intl.DateTimeFormat('es-MX', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    hour12: false, timeZone: 'America/Mexico_City'
  }).format(d)}`
})

// Antes salia la hora actual, que no dice nada de esta gerencia y competia con
// la del cierre -dos relojes, y el mas grande era el que no importaba-.
const navbarSubtitles = computed(() => {
  const { year, week } = $store.currentDate
  return year && week ? [`Semana ${week} · ${year}`] : []
})

watch(
  () => [management.value, $store.currentDate.week, $store.currentDate.year],
  async () => {
    const id = management.value
    const { year, week } = $store.currentDate
    if (!id || !year || !week) return
    try {
      const { data } = await commonService.getEstadoCierres([id], year, week)
      cierre.value = data?.data?.[0] ?? null
    } catch {
      // Informativo: si no llega, la ficha se ve igual sin la marca.
      cierre.value = null
    }
  },
  { immediate: true }
)

// Methods
function handleBack() {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      :title="navbarTitle"
      :subtitles="navbarSubtitles"
      :show-back-button="true"
      @back="handleBack"
    >
      <template #estado>
        <span
          v-if="cierreTexto"
          class="flex flex-shrink items-center gap-1 truncate rounded-full bg-emerald-50 px-2 py-0.5 text-[0.7rem] font-medium text-emerald-700"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z" />
          </svg>
          {{ cierreTexto }}
        </span>
      </template>
    </NavbarCT>

    <!-- Content with Data -->
    <SectionContainer v-if="dashboardData && !isLoading">
      <ManagementInformation
        :data="dashboardData"
        :management-debts="managementDebts"
        :is-loading="isLoading"
      />
    </SectionContainer>

    <!-- Loading State -->
    <LoadSkeleton v-else-if="isLoading" :items="6" class="mt-4" />

    <!-- Empty State -->
    <EmptyCT
      v-else
      message="No hay datos que mostrar"
      description="No se encontraron datos disponibles para esta gerencia."
    />
  </MainCT>
</template>
