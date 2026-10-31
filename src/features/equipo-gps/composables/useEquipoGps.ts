import { computed, ref, watch } from 'vue'
import { useDocumentVisibility, useIntervalFn, useOnline } from '@vueuse/core'
import { EQUIPO_GPS_POLL_MS } from '../equipo-gps.constants'
import { equipoGpsError, equipoGpsService } from '../equipo-gps.service'
import { esSinSenal, guardarFiltro, leerFiltroGuardado, pasaFiltro, pasaSucursal } from '../equipo-gps.helpers'
import type { EquipoRespuesta, FiltroEquipo, GerenteEquipo } from '../equipo-gps.types'

// Estado compartido entre la lista, el modo mapa y el detalle: abrir a un gerente no vuelve a pedir el
// equipo, y volver a la lista la muestra al instante con lo último que se tenía.
const equipo = ref<EquipoRespuesta | null>(null)
const loading = ref(false)
const error = ref('')
const now = ref(Date.now())
/** Momento del último refresco que llegó bien; alimenta «Actualizado hace X s». */
const updatedAt = ref<number | null>(null)
let inflight: Promise<void> | null = null

// El filtro (estado + sucursal) es uno para la lista y el mapa, y se recuerda entre sesiones.
const guardado = leerFiltroGuardado()
const filtro = ref<FiltroEquipo>(guardado?.estado ?? 'todos')
const sucursalFiltro = ref<string | null>(guardado?.sucursal ?? null)
watch([filtro, sucursalFiltro], ([estado, sucursal]) => guardarFiltro(estado, sucursal))

async function cargar() {
  if (inflight) return inflight
  loading.value = true
  inflight = equipoGpsService
    .equipo()
    .then((data) => {
      equipo.value = data
      error.value = ''
      updatedAt.value = Date.now()
    })
    .catch((cause) => {
      error.value = equipoGpsError(cause, 'No se pudo cargar el equipo.')
    })
    .finally(() => {
      loading.value = false
      now.value = Date.now()
      inflight = null
    })
  return inflight
}

/**
 * Lista del equipo con refresco cada minuto sólo mientras la pestaña está visible (batería y datos),
 * y de inmediato al volver a ella o al recuperar la señal.
 */
export function useEquipoGps() {
  const visibility = useDocumentVisibility()
  const online = useOnline()

  const poll = useIntervalFn(cargar, EQUIPO_GPS_POLL_MS, { immediate: false })
  // El «hace X» de cada fila y del encabezado se recalcula sin pedir nada al servidor.
  useIntervalFn(() => (now.value = Date.now()), 5_000)

  watch(
    [visibility, online],
    ([visible, isOnline]) => {
      if (visible === 'visible' && isOnline) {
        void cargar()
        poll.resume()
      } else {
        poll.pause()
      }
    },
    { immediate: true }
  )

  const gerentes = computed<GerenteEquipo[]>(() => equipo.value?.gerentes ?? [])
  const conGerente = computed(() => gerentes.value.filter((g) => g.estado !== 'vacante'))
  const vacantes = computed(() => gerentes.value.filter((g) => g.estado === 'vacante'))
  /** Conteos de estado dentro de la sucursal elegida, y de sucursal dentro del estado elegido: se combinan. */
  const enSucursal = computed(() => conGerente.value.filter((g) => pasaSucursal(g, sucursalFiltro.value)))
  const activos = computed(() => enSucursal.value.filter((g) => g.estado === 'activo').length)
  const sinSenal = computed(() => enSucursal.value.filter(esSinSenal).length)
  /** Sólo las sucursales que FAX dice que el usuario puede ver; una sucursal no se vuelve una lista fija. */
  const sucursales = computed(() =>
    (equipo.value?.sucursales ?? []).map((codigo) => ({
      codigo,
      n: conGerente.value.filter((g) => g.sucursal === codigo && pasaFiltro(g, filtro.value, '')).length
    }))
  )
  /** Los que pasan ambos filtros (sin búsqueda): lo que pinta el mapa. */
  const visibles = computed(() =>
    conGerente.value.filter((g) => pasaFiltro(g, filtro.value, '') && pasaSucursal(g, sucursalFiltro.value))
  )

  // Si el alcance cambió y la sucursal guardada ya no existe, el filtro vuelve a «todas».
  watch(sucursales, (lista) => {
    if (sucursalFiltro.value && lista.length && !lista.some((s) => s.codigo === sucursalFiltro.value)) sucursalFiltro.value = null
  })

  function gerente(id: number) {
    return gerentes.value.find((g) => g.id === id) ?? null
  }

  return {
    equipo, gerentes, conGerente, vacantes, activos, sinSenal, sucursales, visibles, filtro, sucursalFiltro,
    loading, error, now, updatedAt, cargar, gerente
  }
}
