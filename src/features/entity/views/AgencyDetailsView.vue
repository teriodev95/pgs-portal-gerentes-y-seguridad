<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { toCurrency } from '@/shared/utils'

// Components
import CardContainer from '@/shared/components/CardContainer.vue'
import LoanCard from '@/features/entity/components/LoanCard.vue'
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
import DataField from '@/shared/components/DataField.vue'

const router = useRouter()

// Use composable for all logic
const {
  dashboardData,
  dateSelector,
  isDatePickerVisible,
  loansAboutToEnd,
  agency,
  hasLoansToFinish,
  isLoading,
  navigateToHome,
  toggleDatePicker,
  fetchDashboardByDate
} = useAgencyDetails()

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

      <!-- Cash in Field Card -->
      <CardContainer title="Resumen">
        <DataField   
          label="Efectivo en campo" 
          :value="toCurrency(agency.efectivoEnCampo)"
        />

        <DataField 
          label="Prestamos a finalizar"
          :value="loansAboutToEnd?.porFinalizar ?? 0"
        />
      </CardContainer>

      <!-- Loans About To End List -->
      <div v-if="hasLoansToFinish" class="space-y-6">
        <LoanCard v-for="loan in loansAboutToEnd?.prestamos" :key="loan.prestamoId" :loan="loan" />
      </div>
    </SectionContainer>
  </MainCT>
</template>