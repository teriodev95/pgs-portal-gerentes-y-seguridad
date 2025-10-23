<script setup lang="ts">
import { computed, onBeforeMount } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { ROUTE_NAME } from '@/router'
import { useStore } from '@/shared/stores'
import { commonService } from '@/shared/services/modules'

const $router = useRouter()
const $store = useStore()
const $toast = useToast()
const user = computed(() => $store.user)

/**
 * Verifies if the user is authenticated
 * @returns {boolean} - true if the user is authenticated, false otherwise
 */
function checkAuthentication(): boolean {
  if (!user.value || !user.value.usuarioId) {
    $router.push({ name: ROUTE_NAME.AUTH_LOGIN })
    return false
  }
  return true
}

/**
 * Loads management data based on user type
 */
async function loadManagementData() {
  if (!user.value) return false
  if (!$store.isUserRoleValid) {
    $toast.error('No puedes ingresar a PGS porque tu cuenta no tiene el rol requerido. Solo usuarios con roles de Gerente, Seguridad o Regional pueden acceder a esta aplicación.')
    $router.push({ name: ROUTE_NAME.AUTH_LOGIN })
    return false
  }
  try {
    const managementResponse = await commonService.getGerenciesCopy(user.value.usuario)
    const branches = Object.keys(managementResponse.data)

    if (user.value.tipo === 'Seguridad' || user.value.tipo === 'Regional') {
      $store.sucursales = branches
      $store.sucursal = branches[0]
      $store.gerencias = managementResponse.data[$store.sucursal]
      $store.gerenciaSelected = $store.gerencias[0].gerencia
    } else {
      $store.gerencias = managementResponse.data[branches[0]]
      $store.gerenciaSelected = user.value.gerencia || $store.gerencias[0].gerencia
    }

    return true
  } catch (error) {
    $toast.error('Error al cargar las gerencias')
    return false
  }
}

/**
 * Loads agency data for the selected management
 */
async function loadAgencyData() {
  if (!$store.gerenciaSelected) return false

  try {
    const agenciesResponse = await commonService.getAgenciesCopy($store.gerenciaSelected)
    $store.agencies = agenciesResponse.data

    if ($store.agencies.length) {
      $store.agencySelected = $store.agencies[0].agencia
      return true
    }

    return false
  } catch (error) {
    $toast.error('Error al cargar las agencias')
    console.error('Error loading agencies:', error)
    return false
  }
}

/**
 * Loads current date from system
 */
async function loadCurrentDate() {
  try {
    const dateResponse = await commonService.getCurrentDate()
    $store.currentDate = {
      week: dateResponse.data.semana,
      year: dateResponse.data.anio
    }
    return true
  } catch (error) {
    $toast.error('Error al cargar la fecha actual')
    console.error('Error loading current date:', error)
    return false
  }
}

/**
 * Loads collection data for the selected agency
 */
async function loadCollectionData() {
  if (!$store.agencySelected || !$store.currentDate) return false

  try {
    const collectionResponse = await commonService.getCobranza({
      agency: $store.agencySelected,
      week: $store.currentDate.week,
      year: $store.currentDate.year
    })

    $store.cobranzas = collectionResponse.data.cobranza
    if ($store.cobranzas.length) {
      $store.cobranzaSelected = $store.cobranzas[0]
    }

    return true
  } catch (error) {
    $toast.error('Error al cargar los datos de cobranza')
    console.error('Error loading collection data:', error)
    return false
  }
}

/**
 * Loads detailed agency information
 */
async function loadAgencyDetails() {
  if (!$store.agencySelected || !$store.currentDate) return false

  try {
    const agencyDetailsResponse = await commonService.getAgency({
      agency: $store.agencySelected,
      week: $store.currentDate.week,
      year: $store.currentDate.year
    })

    $store.agencyData = agencyDetailsResponse.data
    return true
  } catch (error) {
    $toast.error('Error al cargar los datos de la agencia')
    console.error('Error loading agency details:', error)
    return false
  }
}

/**
 * Preloads all required data for the dashboard
 */
async function preloadDashboardData() {
  if (!user.value) return

  $store.loading = true

  try {
    const managementDataLoaded = await loadManagementData()
    if (!managementDataLoaded) return

    const agenciesLoaded = await loadAgencyData()
    if (!agenciesLoaded) return

    const dateLoaded = await loadCurrentDate()
    if (!dateLoaded) return

    await Promise.all([
      loadCollectionData(),
      loadAgencyDetails()
    ])
  } catch (error) {
    $toast.error('Error al cargar los datos')
    console.error('General error loading dashboard data:', error)
  } finally {
    $store.loading = false
  }
}

onBeforeMount(async () => {
  if (checkAuthentication()) await preloadDashboardData()
})
</script>

<template>
  <RouterView />
</template>