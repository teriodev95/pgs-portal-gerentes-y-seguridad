import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '../composables'
import type { IAgencyBasicInfo, IGerencia } from '@/interfaces'
import type { IAgencyDashboard } from '@/shared/types'
import type { ICobranza } from '@/interfaces'
import type { IUser } from '@/features/auth/types'

interface DataStore {
  user?: IUser
  authPin?: string
  elysiaToken?: string
}

const STORE_NAME = 'store'
const $storage = useStorage<DataStore>(STORE_NAME)

export const useStore = defineStore(STORE_NAME, () => {
  const agencies = ref<IAgencyBasicInfo[]>([])
  const agencySelected = ref<string>()
  const agencyData = ref<IAgencyDashboard>()
  const cobranzas = ref<ICobranza[]>([])
  const cobranzasWithCrtp = computed<ICobranza[]>(() =>
    cobranzas.value.filter((cobranza) => cobranza.crtp === 0)
  )
  const hasCobranzasWithCrtp = computed<boolean>(() =>
    cobranzas.value.some((cobranza) => cobranza.crtp === 0)
  )
  const isUserRoleValid = computed(() => {
    const validRoles = ['Seguridad', 'Regional', 'Gerente']
    return !!user.value && validRoles.includes(user.value.tipo)
  })

  const cobranzaSelected = ref<ICobranza>()
  const currentDate = ref<{ year: number; week: number }>({
    week: 0,
    year: 0
  })
  const gerencias = ref<IGerencia[]>([])
  const gerenciaSelected = ref<string>()
  const isAuth = ref(false)
  const authPin = ref<string>()
  const elysiaToken = ref<string>()
  const loading = ref<boolean>(false)
  const sucursales = ref<string[]>([])
  const sucursal = ref<string>()
  const user = ref<IUser>()

  /**
   * -----------------------------------------
   *	Methods
   * -----------------------------------------
   */

  /**
   * clearData
   */
  function clearData() {
    agencies.value = []
    agencySelected.value = undefined
    agencyData.value = undefined
    cobranzas.value = []
    cobranzaSelected.value = undefined
    gerencias.value = []
    gerenciaSelected.value = undefined
    sucursales.value = []
    sucursal.value = undefined
    user.value = undefined
    authPin.value = undefined
    elysiaToken.value = undefined
    $storage.remove()
  }
  /**
   * cargar datos del storage
   */
  function loadData() {
    const storage = $storage.get()

    if (storage) {
      user.value = storage.user
      authPin.value = storage.authPin
      elysiaToken.value = storage.elysiaToken
    }
  }

  /**
   * resetAgencyData
   */
  function resetAgencyData() {
    agencySelected.value = undefined
    agencyData.value = undefined
    cobranzaSelected.value = undefined
    cobranzas.value = []
  }

  /**
   * Guardar datos en storage
   */
  function saveData() {
    $storage.set({
      user: user.value,
      authPin: authPin.value,
      elysiaToken: elysiaToken.value
    })
  }

  const isAgencyUsingApp = computed<boolean>(() => {
    if (!agencySelected.value) {
      return false
    }

    const agency = agencies.value.find((agency) => agency.agencia === agencySelected.value)

    console.log('isAgencyUsingApp', agency?.usaApp)
    return agency?.usaApp === false
  })

  return {
    agencies,
    agencyData,
    agencySelected,
    authPin,
    elysiaToken,
    cobranzas,
    cobranzaSelected,
    cobranzasWithCrtp,
    currentDate,
    gerencias,
    gerenciaSelected,
    hasCobranzasWithCrtp,
    isAgencyUsingApp,
    isAuth,
    isUserManager: computed<boolean>(() => user.value?.tipo === 'Gerente'),
    loading,
    sucursal,
    sucursales,
    user,
    isUserRoleValid,

    // Methods
    clearData,
    loadData,
    resetAgencyData,
    saveData
  }
})
