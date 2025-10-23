<script lang="ts" setup>
import { computed } from 'vue'
import InputSelect from '@/shared/components/forms/InputSelect.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import CardContainer from '@/shared/components/CardContainer.vue'

interface Props {
  filterYear: number
  filterWeek: number
}

interface Emits {
  (event: 'update:filters', value: { year?: number; week?: number }): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const currentYear = computed(() => new Date().getFullYear())

const yearOptions = computed(() => {
  const years = []
  for (let year = 2015; year <= currentYear.value; year++) {
    years.push(year)
  }
  return years
})

const weekOptions = computed(() => {
  const weeks = []
  for (let week = 1; week <= 52; week++) {
    weeks.push(week)
  }
  return weeks
})

const handleYearChange = (value: string | number) => {
  emit('update:filters', { year: Number(value) })
}

const handleWeekChange = (value: string | number) => {
  emit('update:filters', { week: Number(value) })
}
</script>

<template>
  <CardContainer>
    <h3 class="title">Filtros</h3>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <LabelForm for="filter-year" size="xs">
          Año
        </LabelForm>
        <InputSelect
          id="filter-year"
          :model-value="filterYear"
          placeholder="Seleccionar año"
          @update:model-value="handleYearChange"
        >
          <option v-for="year in yearOptions" :key="year" :value="year">
            {{ year }}
          </option>
        </InputSelect>
      </div>
      <div>
        <LabelForm for="filter-week" size="xs">
          Semana
        </LabelForm>
        <InputSelect
          id="filter-week"
          :model-value="filterWeek"
          placeholder="Seleccionar semana"
          @update:model-value="handleWeekChange"
        >
          <option v-for="week in weekOptions" :key="week" :value="week">
            {{ week }}
          </option>
        </InputSelect>
      </div>
    </div>
  </CardContainer>
</template>