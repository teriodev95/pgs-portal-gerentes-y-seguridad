<script setup lang="ts">
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import InputSelect from '@/shared/components/forms/InputSelect.vue'
import CardContainer from '@/shared/components/CardContainer.vue'

interface Props {
  managementList: string[]
  selectedManagement: string
  agencyList: string[]
  selectedAgency: string
  hasVisit: boolean | null
  isFilterDisabled: boolean
  isUserManager: boolean
}

interface Emit {
  (e: 'update:selectedManagement', value: string): void
  (e: 'update:selectedAgency', value: string): void
  (e: 'update:hasVisit', value: boolean | null): void
  (e: 'managementChange'): void
  (e: 'agencyChange'): void
}

defineProps<Props>()
const emit = defineEmits<Emit>()

function handleManagementChange(value: string | number) {
  emit('update:selectedManagement', value as string)
  emit('managementChange')
}

function handleAgencyChange(value: string | number) {
  emit('update:selectedAgency', value as string)
  emit('agencyChange')
}

function handleVisitFilterChange(value: string | number) {
  const visitValue = value === 'all' ? null : value === 'true'
  emit('update:hasVisit', visitValue)
}
</script>

<template>
  <CardContainer class="flex items-center justify-between">
    <form class="flex gap-4">
      <!-- Management Filter -->
      <div>
        <LabelForm for="management_select" size="sm">Gerencia</LabelForm>
        <InputSelect
          id="management_select"
          :model-value="selectedManagement"
          @update:model-value="handleManagementChange"
          :is-disabled="isUserManager || isFilterDisabled"
          :is-required="false"
        >
          <option v-if="managementList.length === 0" value="">-- Cargando --</option>
          <template v-else>
            <option v-for="management in managementList" :key="management" :value="management">
              {{ management }}
            </option>
          </template>
        </InputSelect>
      </div>

      <!-- Agency Filter -->
      <div>
        <LabelForm for="agency_select" size="sm">Agencia</LabelForm>
        <InputSelect
          id="agency_select"
          :model-value="selectedAgency"
          @update:model-value="handleAgencyChange"
          :is-disabled="isFilterDisabled"
          :is-required="false"
        >
          <option v-if="agencyList.length === 0" value="">-- Cargando --</option>
          <template v-else>
            <option v-for="agency in agencyList" :key="agency" :value="agency">
              {{ agency }}
            </option>
          </template>
        </InputSelect>
      </div>
    </form>

    <!-- Visit Filter -->
    <div>
      <LabelForm for="visit_select" size="sm">Visitas</LabelForm>
      <InputSelect
        id="visit_select"
        :model-value="hasVisit === null ? 'all' : String(hasVisit)"
        @update:model-value="handleVisitFilterChange"
        :is-disabled="isFilterDisabled"
        :is-required="false"
      >
        <option value="all">Todas</option>
        <option value="true">Con visitas</option>
        <option value="false">Sin visitas</option>
      </InputSelect>
    </div>
  </CardContainer>
</template>