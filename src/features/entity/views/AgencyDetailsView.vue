<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'

// Components
import CardContainer from '@/shared/components/CardContainer.vue'
import AgencyExitRow from '@/features/entity/components/AgencyExitRow.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import DatePickerSection from '@/features/entity/components/DatePickerSection.vue'
import AgencyGeneralData from '@/features/entity/components/AgencyGeneralData.vue'
import AgencyStatusCard from '@/features/entity/components/AgencyStatusCard.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'

// Composables
import { useAgencyDetails } from '../composables'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'

const router = useRouter()

// Use composable for all logic
const {
  dashboardData,
  dateSelector,
  isDatePickerVisible,
  salidas,
  agency,
  hasSalidas,
  isLoading,
  navigateToHome,
  navigateToLoanDetails,
  toggleDatePicker,
  fetchDashboardByDate
} = useAgencyDetails()

// Solo se nombran los grupos que tienen gente: un "0 especiales" es ruido.
const resumenSalidas = computed(() => {
  const r = salidas.value?.resumen
  if (!r) return ''
  const partes = [
    r.terminaron ? `${r.terminaron} ${r.terminaron === 1 ? 'terminó' : 'terminaron'} de pagar` : '',
    r.conDescuento ? `${r.conDescuento} con descuento` : '',
    r.especiales ? `${r.especiales} ${r.especiales === 1 ? 'especial' : 'especiales'}` : ''
  ].filter(Boolean)
  return partes.join(' · ')
})

// Methods
function handleBack() {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Detalles de la agencia"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- Loading State -->
    <LoadSkeleton v-if="isLoading" :items="6" />

    <SectionContainer v-else-if="agency && !isLoading">
      <!-- General Data Card -->
      <CardContainer>
        <DatePickerSection
          :is-visible="isDatePickerVisible"
          :date-value="dateSelector"
          :dashboard-data="dashboardData"
          :is-loading="isLoading"
          @toggle="toggleDatePicker"
          @date-change="fetchDashboardByDate"
        />

        <!-- Current Agency Data -->
        <div v-if="!isDatePickerVisible" class="space-y-2">
          <AgencyGeneralData :agency="agency" />
        </div>

        <BtnComponent @click="navigateToHome" full-width>Aceptar</BtnComponent>
      </CardContainer>

      <!-- Agency Status Card -->
      <CardContainer>
        <AgencyStatusCard 
          :agency-name="agency.agencia" 
          :status="agency.statusAgencia" 
        />
      </CardContainer>

      <!-- Salidas de cartera de la semana en curso -->
      <CardContainer title="Salen esta semana">
        <template v-if="hasSalidas">
          <TextCT v-if="resumenSalidas" variant="secondary">{{ resumenSalidas }}</TextCT>

          <div v-if="salidas?.salidas.length">
            <AgencyExitRow
              v-for="salida in salidas.salidas"
              :key="`salida-${salida.prestamoId}`"
              :salida="salida"
              @select="navigateToLoanDetails"
            />
          </div>

          <template v-if="salidas?.porTerminar.length">
            <TextCT variant="tertiary" class="mt-4">
              Por terminar esta semana: {{ salidas.porTerminar.length }}
            </TextCT>
            <div>
              <AgencyExitRow
                v-for="pendiente in salidas.porTerminar"
                :key="`por-terminar-${pendiente.prestamoId}`"
                :por-terminar="pendiente"
                @select="navigateToLoanDetails"
              />
            </div>
          </template>
        </template>

        <TextCT v-else variant="tertiary">Nadie ha salido de cartera esta semana.</TextCT>
      </CardContainer>
    </SectionContainer>
  </MainCT>
</template>