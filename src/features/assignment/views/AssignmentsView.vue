<script setup lang="ts">
import { computed } from 'vue'
import { ROUTE_NAME } from '@/router'
import { useRoute, useRouter } from 'vue-router'
import { useAssignmentsData } from '../composables'
// Components import
import SectionContainer from '@/shared/components/SectionContainer.vue'
import AssignmentWidget from '../components/AssignmentWidget.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import EmptyCT from '@/shared/components/ui/EmptyCT.vue'

// Composables
const route = useRoute()
const router = useRouter()
const {
  assignmentData,
  isLoading,
  hasAssignments,
  navigateToCorrection
} = useAssignmentsData('agency')

// View-specific computed properties
const redirectRoute = computed(() =>
  route.query.from === 'cash-flow' ? ROUTE_NAME.DASHBOARD_CASH_FLOW : ROUTE_NAME.DASHBOARD_HOME
)

// Methods
function handleBack() {
  router.push({ name: redirectRoute.value })
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

    <!-- Assignments List -->
    <SectionContainer v-if="hasAssignments">
      <AssignmentWidget v-for="(assignment, index) in assignmentData.assignments" :key="`assignment-${index}`" :assignment="assignment"
        type="agency" @action:correction-request="navigateToCorrection"/>
    </SectionContainer>

    <!-- Loading State -->
    <SectionContainer v-else-if="isLoading">
      <LoadSkeleton :items="8" class="bg-white" />
    </SectionContainer>

    <!-- Empty State -->
    <EmptyCT
      v-else
      message="No se encontraron asignaciones"
      description="Aún no has creado ninguna asignación en esta agencia"
    />
  </MainCT>
</template>