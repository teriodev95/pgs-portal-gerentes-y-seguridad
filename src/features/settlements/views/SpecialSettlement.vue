<script setup lang="ts">
import { ref } from 'vue'
import { ROUTE_NAME } from '@/router'
import { settlementsService } from '../services/settlements.service'
import { useRevealCircle } from '@/shared/composables/useRevealCircle'
import type { ISpecialSettlement } from '../types'

// Components
import BtnComponent from '@/shared/components/BtnComponent.vue'
import CardContainer from '@/shared/components/CardContainer.vue'
import FormGeneric from '@/shared/components/forms/FormGeneric.vue'
import InputGeneric from '@/shared/components/forms/InputGeneric.vue'
import LabelForm from '@/shared/components/forms/LabelForm.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import NavbarTop from '@/shared/components/NavbarTop.vue'
import RevealCircle from '@/shared/components/RevealCircle.vue'
import SectionContainer from '@/shared/components/SectionContainer.vue'
import SlideUnlock from 'vue-slide-unlock'
import SpecialLiquidationData from '../components/SpecialLiquidationData.vue'

const { isVisible , config, showRevealCircle, hideRevealCircle } = useRevealCircle()

const isProcessing = ref<boolean>(false)
const loading = ref<boolean>(false)
const loanData = ref<ISpecialSettlement>()
const loanID = ref<string>('')
const slideUnlockRef = ref()

const handleSearch = async () => {
  console.log('Buscando préstamo:', loanID.value)
  try {
    loading.value = true
    const { data } = await settlementsService.getSpecialSettlement(loanID.value)
    loanData.value = data
  } catch (error) {
    console.error('Error al buscar el préstamo:', error)
  } finally {
    loading.value = false
  }
}

const handleProcessSettlement = () => {
  slideUnlockRef.value?.reset()
  showRevealCircle({
    type: 'success',
    mainText: 'Liquidación exitosa',
    secondaryText: `Se guardó con éxito la liquidación de ${loanData.value?.cliente || ''}`
  })
}
</script>

<template>
  <main class="relative min-h-screen bg-slate-100" :class="{'h-screen overflow-hidden' : isVisible}">
    <!-- Success Notification -->
    <RevealCircle
      v-show="isVisible"
      :type="config.type"
      :main-text="config.mainText"
      :secondary-text="config.secondaryText"
      @action:cancel="hideRevealCircle" />

    <!-- Navigation Header -->
    <div class="sticky top-0 z-20 w-full bg-white p-2">
      <NavbarTop label="Liquidación Especial" :back="{ name: ROUTE_NAME.DASHBOARD_HOME }" 
      />
    </div>

    <!-- Settlement Content -->
     <SectionContainer>
      <CardContainer title="Buscar Prestamo">
        <FormGeneric @submit="handleSearch">
           <div>
            <LabelForm for="loanID">
              ID del Préstamo
            </LabelForm>
            <InputGeneric
              id="loanID"
              type="text"
              v-model="loanID"
              placeholder="Ingrese el préstamo"
            />
          </div>

          <BtnComponent type="submit" class="w-full mt-4" variant="primary">
            Buscar
          </BtnComponent>
        </FormGeneric>
      </CardContainer>

      <!-- Loading State -->
      <LoadSkeleton v-if="loading" :items="6" class="mt-4" />

      <template  v-else-if="!loading && loanData">
        <SpecialLiquidationData :data="loanData" />

        <slide-unlock 
        ref="slideUnlockRef" 
        :auto-width="true" 
        :circle="true" 
        :disabled="isProcessing || false" 
        :noanimate="false"
        text="Continuar" 
        success-text="Completado" 
        name="slideunlock" 
        :style="{
          '--su-color-text-normal': 'white',
          '--su-color-bg': 'rgb(26 86 219 / 1)',
          '--su-color-progress-normal-bg': 'rgb(14 159 110 / 1)',
          '--su-color-progress-complete-bg': 'rgb(14 159 110 / 1)',
          '--su-size-padding': '0'
        }" 
        @completed="handleProcessSettlement" 
      />
      </template>
     </SectionContainer>
  </main>
</template>