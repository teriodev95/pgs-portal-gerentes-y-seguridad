<script setup lang="ts">
import { ROUTE_NAME } from '@/router'
import { useAssignmentsData } from '../composables'
//* Components
import AssignmentWidget from '@/features/assignment/components/AssignmentWidget.vue'
import BoxCloseOutline from '@/shared/components/icons/BoxCloseOutline.vue'
import FloatBtn from '@/shared/components/FloatBtn.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'

// Composables
const {
  assignmentData,
  isLoading,
  hasAssignments,
  navigateToCorrection,
  navigateToCreateAssignment
} = useAssignmentsData('management')
</script>

<template>
  <main class="min-h-screen bg-slate-100">
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Asignaciones" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" />
    </div>

    <div data-dial-init class="group fixed bottom-[1.5rem] right-6 z-50">
      <FloatBtn @click="navigateToCreateAssignment" type="primary" />
    </div>

    <SectionContainer>
      <LoadSkeleton v-if="isLoading" :items="8" class="mt-4" />

      <template v-else>
        <div v-if="hasAssignments" class="space-y-2">
          <h1 class="title">Ingresos</h1>
          <AssignmentWidget v-for="(income, assKey) in assignmentData.incomes" :key="`inc-${assKey}`" :assignment="income"
            icon="income" type="management"  @action:correction-request="navigateToCorrection"/>
          <h1 class="title">Egresos</h1>
          <AssignmentWidget v-for="(expense, assKey) in assignmentData.expenses" :key="`exp-${assKey}`" :assignment="expense"
            icon="expense" type="management"  @action:correction-request="navigateToCorrection"/>
        </div>
        <div v-else class="flex min-h-[32rem] items-center justify-center">
          <div class="text-center text-gray-600">
            <BoxCloseOutline class="mx-auto h-28 w-28" />

            <div class="mt-2 text-center">
              <h2 class="text-2xl font-semibold">No se encontraron asignaciones</h2>
            </div>
          </div>
        </div>
      </template>

    </SectionContainer>
  </main>
</template>