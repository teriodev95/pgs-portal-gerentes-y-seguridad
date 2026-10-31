import { computed, ref, watch } from 'vue'
import { useDocumentVisibility, useIntervalFn, useOnline } from '@vueuse/core'
import { EQUIPO_GPS_POLL_MS } from '../equipo-gps.constants'
import { equipoGpsError, equipoGpsService } from '../equipo-gps.service'
import type { EquipoRespuesta, GerenteEquipo } from '../equipo-gps.types'

// Estado compartido entre la lista y el detalle: abrir a un gerente no vuelve a pedir el equipo,
// y volver a la lista la muestra al instante con lo último que se tenía.
const equipo = ref<EquipoRespuesta | null>(null)
const loading = ref(false)
const error = ref('')
const now = ref(Date.now())
let inflight: Promise<void> | null = null

async function cargar() {
  if (inflight) return inflight
  loading.value = true
  inflight = equipoGpsService
    .equipo()
    .then((data) => {
      equipo.value = data
      error.value = ''
    })
    .catch((cause) => {
      error.value = equipoGpsError(cause, 'No se pudo cargar el equipo. Intenta de nuevo.')
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
  // El «hace X min» de cada fila se recalcula sin pedir nada al servidor.
  useIntervalFn(() => (now.value = Date.now()), 15_000)

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
  const activos = computed(() => gerentes.value.filter((g) => g.estado === 'activo').length)

  function gerente(id: number) {
    return gerentes.value.find((g) => g.id === id) ?? null
  }

  return { equipo, gerentes, activos, loading, error, now, cargar, gerente }
}
