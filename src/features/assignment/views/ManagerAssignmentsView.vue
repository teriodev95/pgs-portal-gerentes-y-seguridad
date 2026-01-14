<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { useAssignmentsData } from '../composables'
// Components
import AssignmentWidget from '@/features/assignment/components/AssignmentWidget.vue'
import FloatBtn from '@/shared/components/FloatBtn.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'

// Composables
const router = useRouter()
const {
  assignmentData,
  isLoading,
  hasAssignments,
  navigateToCorrection,
  navigateToCreateAssignment
} = useAssignmentsData('management')

// Methods
function handleBack() {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Asignaciones"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- Floating Action Button -->
    <div data-dial-init class="group fixed bottom-[1.5rem] right-6 z-50">
      <FloatBtn @click="navigateToCreateAssignment" type="primary" />
    </div>

    <!-- Loading State -->
    <SectionContainer v-if="isLoading">
      <LoadSkeleton :items="8" class="mt-4" />
    </SectionContainer>

    <!-- Assignments List -->
    <SectionContainer v-else-if="hasAssignments">
      <div class="space-y-2">
        <h1 class="title">Ingresos</h1>
        <AssignmentWidget
          v-for="(income, assKey) in assignmentData.incomes"
          :key="`inc-${assKey}`"
          :assignment="income"
          icon="income"
          type="management"
          @action:correction-request="navigateToCorrection"
        />
        <h1 class="title">Egresos</h1>
        <AssignmentWidget
          v-for="(expense, assKey) in assignmentData.expenses"
          :key="`exp-${assKey}`"
          :assignment="expense"
          icon="expense"
          type="management"
          @action:correction-request="navigateToCorrection"
        />
      </div>
    </SectionContainer>

    <!-- Empty State -->
    <EmptyCT
      v-else
      message="No se encontraron asignaciones"
      description="No hay asignaciones de ingresos o egresos disponibles. Crea una nueva asignación usando el botón de abajo."
    />
  </MainCT>
</template>