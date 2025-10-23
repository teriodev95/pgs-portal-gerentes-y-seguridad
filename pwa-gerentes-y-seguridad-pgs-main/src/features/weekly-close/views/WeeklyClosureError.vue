<script setup lang="ts">
import { useStore } from '@/shared/stores';
import { ROUTE_NAME } from '@/router';

// Store initialization
const $store = useStore();
</script>

<template>
  <section class="h-screen flex justify-center items-center">
    <div class="p-8 space-y-4">
      <div class="space-y-2">
        <h1 class="title text-center">Clientes pendientes de pago</h1>

        <h2 class="subtitle text-center">
          Hay {{ $store.cobranzasWithCrtp.length }} clientes con pagos pendientes en la agencia
          {{ $store.agencySelected }}. Registra los pagos o ingresa "0" en
          los clientes que no realizaron pago esta semana para continuar con el cierre.
        </h2>
      </div>

      <div class="space-y-2">
        <RouterLink :to="{ name: ROUTE_NAME.LOAN_PAYMENT }" class="inline-block btn btn-primary w-full">
          Registrar pagos
        </RouterLink>

        <RouterLink :to="{ name: ROUTE_NAME.DASHBOARD_HOME }" class="inline-block btn btn-primary-outline w-full">
          Regresar
        </RouterLink>
      </div>
    </div>
  </section>
</template>