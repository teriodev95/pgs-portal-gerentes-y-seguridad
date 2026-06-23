<script setup lang="ts">
import { computed } from 'vue'
import { WalletCards } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { useStore } from '@/shared/stores'
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
const $store = useStore()
const {
  assignmentData,
  isLoading,
  hasAssignments,
  navigateToCorrection,
  navigateToCreateAssignment
} = useAssignmentsData('management')

const canUseCustody = computed(() => ['Seguridad', 'Regional'].includes($store.user?.tipo ?? ''))

// Methods
function handleBack() {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}

function navigateToCustody() {
  router.push({ name: ROUTE_NAME.MANAGER_ASSIGNMENTS_CUSTODY })
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
    <div data-dial-init class="group fixed bottom-[1.5rem] right-6 z-50 flex items-center gap-3">
      <button
        v-if="canUseCustody"
        type="button"
        class="inline-flex h-12 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-sm font-medium text-blue-700 shadow-[0px_0px_11px_4px_rgba(0,0,0,0.12)] hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
        @click="navigateToCustody"
      >
        <WalletCards class="size-4" :stroke-width="1.8" />
        Custodia
      </button>
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
