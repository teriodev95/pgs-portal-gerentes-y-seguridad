<script setup lang="ts">
import { computed } from 'vue'
import { ROUTE_NAME } from '@/router'
import { useRoute } from 'vue-router'
import { useAssignmentsData } from '../composables'
// Components import
import SectionContainer from '@/shared/components/SectionContainer.vue'
import AssignmentWidget from '../components/AssignmentWidget.vue'
import BoxCloseOutline from '@/shared/components/icons/BoxCloseOutline.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'

// Composables
const route = useRoute()
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
</script>

<template>

  <main class="min-h-screen bg-slate-100">
    <!-- Top Navigation Bar -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Asignaciones" :back="{ name: redirectRoute }" />
    </div>

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
    <div v-else class="flex min-h-[32rem] items-center justify-center">
      <div class="text-center text-gray-600">
        <BoxCloseOutline class="mx-auto h-28 w-28" />

        <div class="mt-2 text-center">
          <h2 class="text-2xl font-semibold">No se encontraron asignaciones</h2>
        </div>
      </div>
    </div>
  </main>
</template>