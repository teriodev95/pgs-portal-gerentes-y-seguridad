<script lang="ts" setup>
import { ROUTE_NAME } from '@/router'
import { toCurrency } from '@/shared/utils'

// Components
import CardContainer from '@/shared/components/CardContainer.vue'
import LoanCard from '@/features/entity/components/LoanCard.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import DatePickerSection from '@/features/entity/components/DatePickerSection.vue'
import AgencyGeneralData from '@/features/entity/components/AgencyGeneralData.vue'
import AgencyStatusCard from '@/features/entity/components/AgencyStatusCard.vue'
import MetricCard from '@/features/entity/components/MetricCard.vue'

// Composables
import { useAgencyDetails } from '../composables'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'

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
</script>

<template>
  <main class="min-h-screen bg-slate-100">
    <!-- Top Navigation Bar -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Detalles de la agencia" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
    </div>


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

        <button type="button" @click="navigateToHome" class="btn btn-primary w-full">
          Aceptar
        </button>
      </CardContainer>

      <!-- Agency Status Card -->
      <CardContainer>
        <AgencyStatusCard 
          :agency-name="agency.agencia" 
          :status="agency.statusAgencia" 
        />
      </CardContainer>

      <!-- Cash in Field Card -->
      <CardContainer>
        <MetricCard 
          title="Efectivo en campo" 
          :value="toCurrency(agency.efectivoEnCampo)" 
        />
      </CardContainer>

      <!-- Loans Ending Card -->
      <CardContainer>
        <MetricCard 
          title="Prestamos a finalizar" 
          :value="loansAboutToEnd?.porFinalizar ?? 0" 
        />
      </CardContainer>

      <!-- Loans About To End List -->
      <div v-if="hasLoansToFinish" class="space-y-6">
        <LoanCard v-for="loan in loansAboutToEnd?.prestamos" :key="loan.prestamoId" :loan="loan" />
      </div>
    </SectionContainer>
  </main>
</template>