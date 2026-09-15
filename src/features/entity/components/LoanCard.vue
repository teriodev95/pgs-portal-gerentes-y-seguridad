<script setup lang="ts">
import type { ILoan } from '@/features/loan/types'
import { ROUTE_NAME } from '@/router'
import { useRouter } from 'vue-router'
import DataField from '@/shared/components/DataField.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'

interface Props {
  loan: ILoan
}

defineProps<Props>()

const $router = useRouter()

function goToPrestamo(id: number | string) {
  void $router.push({
    name: ROUTE_NAME.DASHBOARD_PRESTAMO,
    query: {
      prestamo: id
    }
  })
}
</script>

<template>
  <div class="space-y-3 rounded-lg border bg-white p-4">
    <h1 class="title">{{ loan.prestamoId }}</h1>

    <div class="space-y-2">
      <DataField label="Nombres" :value="loan.nombres" />
      <DataField label="Apellido paterno" :value="loan.apellidoPaterno" />
      <DataField label="Apellido materno" :value="loan.apellidoMaterno" />
      <DataField label="Dirección" :value="loan.direccion" />
      <DataField label="Tipo de crédito" :value="loan.tipoDeCredito" />
      <DataField label="Tipo de cliente" :value="loan.tipoDeCliente" />
      <DataField label="Identificador" :value="loan.identificadorCredito" />
    </div>


    <BtnComponent @click="goToPrestamo(loan.prestamoId)" full-width>
      Detalles del prestamo
    </BtnComponent>
  </div>
</template>
