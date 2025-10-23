<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { useToast } from 'vue-toast-notification'
import { initModals } from 'flowbite'
import { APP_VERSION, ELEMENT_ID } from '@/shared/constants'
import { useStore } from '@/shared/stores'
import { commonService } from '@/shared/services/modules'

// Components
import LogoutPopup from '@/shared/components/LogoutPopup.vue'
import IconUser from '@/shared/components/icons/UserCircle.vue'
import IconLogout from '@/shared/components/icons/UserLogout.vue'
import IconBankNotes from '@/shared/components/icons/BankNotesIcon.vue'

// Services, Composables and Stores initialization
const $router = useRouter()
const $store = useStore()
const $toast = useToast()


// Constants
const drawerId = ELEMENT_ID.DRAWER_LEFT
const logoutId = ELEMENT_ID.POPUP_LOGOUT
const version = APP_VERSION

// State definitions
const sucursales = computed(() => $store.sucursales)
const user = computed(() => $store.user)

// Methods
async function preloadData(sucursal: string) {
  if (user.value) {
    $store.loading = true
    try {
      $store.gerencias = []
      $store.gerenciaSelected = undefined
      $store.agencies = []
      $store.agencySelected = undefined
      $store.cobranzas = []
      $store.cobranzaSelected = undefined
      if (user.value.tipo === 'Seguridad' || user.value.tipo === 'Regional') {
        const gerenciasResp = await commonService.getGerenciesCopy(user.value.usuario)

        const sucursales = Object.keys(gerenciasResp.data)
        $store.sucursales = sucursales
        $store.sucursal = sucursal
        $store.gerencias = gerenciasResp.data[$store.sucursal]

        $store.gerenciaSelected = $store.gerencias[0].gerencia
      } else {
        $store.gerenciaSelected = user.value.gerencia
      }

      if ($store.gerenciaSelected) {
        const agenciesResp = await commonService.getAgenciesCopy($store.gerenciaSelected)
        $store.agencies = agenciesResp.data
        console.log({ agencies: $store.agencies })

        if ($store.agencies.length) {
          $store.agencySelected = $store.agencies[0].agencia

          const dateResp = await commonService.getCurrentDate()
          $store.currentDate = {
            week: dateResp.data.semana,
            year: dateResp.data.anio
          }

          const cobranzaResp = await commonService.getCobranza({
            agency: $store.agencySelected,
            week: $store.currentDate.week,
            year: $store.currentDate.year
          })

          $store.cobranzas = cobranzaResp.data.cobranza
          if ($store.cobranzas.length) $store.cobranzaSelected = $store.cobranzas[0]

          const agencyResp = await commonService.getAgency({
            agency: $store.agencySelected,
            week: $store.currentDate.week,
            year: $store.currentDate.year
          })

          $store.agencyData = agencyResp.data
        }
      }
    } catch (error) {
      $toast.error('Error al cargar los datos')
    }
    $store.loading = false
  }
}

function logout() {
  $router.push({
    name: ROUTE_NAME.AUTH_LOGIN
  })
  $store.clearData()
}

// Lifecycle hooks
onMounted(() => {
  setTimeout(() => {
    initModals()
  }, 500)
})
</script>

<template>
  <!-- drawer component -->
  <div
    :id="drawerId"
    class="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full overflow-y-auto bg-white p-4 transition-transform dark:bg-gray-800"
    tabindex="-1"
    :aria-labelledby="`${drawerId}-label`"
  >
    <button
      type="button"
      :data-drawer-hide="drawerId"
      :aria-controls="drawerId"
      class="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
    >
      <svg
        class="h-3 w-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 14"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
        />
      </svg>
      <span class="sr-only">Close menu</span>
    </button>

    <div class="mt-6 flex items-center gap-2 p-2 text-slate-600">
      <IconUser class="h-12 w-12" />
      <div class="text-left">
        <h1 class="text-lg">{{ user?.nombre }}</h1>
        <h1 class="text-xs">{{ user?.tipo }}</h1>
        <p class="text-xs">{{ user?.numeroCelular }}</p>
      </div>
    </div>
    <div class="mt-2 overflow-y-auto py-4">
      <div
        class="rounded-lg p-2 text-center text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
      >
        Sucursales
      </div>

      <ul class="space-y-2 font-medium">
        <li
          v-for="(sucursal, key) in sucursales"
          :key="`sucursal-${key}`"
          :data-drawer-hide="drawerId"
          @click="() => preloadData(sucursal)"
          :class="[
            $store.sucursal === sucursal ? 'bg-blue-200' : '',
            'group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
          ]"
        >
          <IconBankNotes class="h-6 w-6" />
          <span class="ml-3">{{ sucursal }} </span>
        </li>
      </ul>

      <div class="mt-4 w-full border border-t-blue-200"></div>

      <ul class="mt-4 space-y-2 font-medium">
        <li
          :data-drawer-hide="drawerId"
          :data-modal-target="logoutId"
          :data-modal-toggle="logoutId"
          class="group flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        >
          <IconLogout class="h-6 w-6" />
          <span class="ml-3">Cerrar Sesión</span>
        </li>
      </ul>

      <div class="absolute bottom-2 text-slate-600">Version {{ version }}</div>
    </div>
  </div>

  <LogoutPopup @action:ok="logout" />
</template>
