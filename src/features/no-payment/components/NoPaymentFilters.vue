<script setup lang="ts">
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import InputSelect from '@/shared/components/forms/InputSelect.vue'
import CardContainer from '@/shared/components/CardContainer.vue'

interface Props {
  managementList: string[]
  selectedManagement: string
  agencyList: string[]
  selectedAgency: string
  hasVisit: boolean
  isFilterDisabled: boolean
  isUserManager: boolean
}

interface Emit {
  (e: 'update:selectedManagement', value: string): void
  (e: 'update:selectedAgency', value: string): void
  (e: 'update:hasVisit', value: boolean): void
  (e: 'managementChange'): void
}

defineProps<Props>()
const emit = defineEmits<Emit>()

function handleManagementChange(value: string | number) {
  emit('update:selectedManagement', value as string)
  emit('managementChange')
}

function handleAgencyChange(value: string | number) {
  emit('update:selectedAgency', value as string)
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
          <option v-for="management in managementList" :key="management" :value="management">
            {{ management }}
          </option>
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
          <option value="">-- TODAS --</option>
          <option v-for="agency in agencyList" :key="agency" :value="agency">
            {{ agency }}
          </option>
        </InputSelect>
      </div>
    </form>

    <!-- Visit Toggle -->
    <label class="mb-5 inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        :checked="hasVisit"
        @change="$emit('update:hasVisit', ($event.target as HTMLInputElement).checked)"
        class="peer sr-only"
        :disabled="isFilterDisabled"
      />
      <div
        class="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full">
      </div>
      <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Visita</span>
    </label>
  </CardContainer>
</template>