<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from '@/shared/stores'
import type { IGerencia } from '@/interfaces'
import { useRouter } from 'vue-router'
import { ROUTE_NAME } from '@/router'
import { commonService } from '@/shared/services/modules'
import { useNotification } from '@/shared/composables/useNotification'

// Interface - Props - Emits
interface GerencySliderProps {
  gerencias: IGerencia[]
}

const props = defineProps<GerencySliderProps>()

// Services, Composables and Stores initialization
const $router = useRouter()
const $store = useStore()
const { showError } = useNotification()

// State definitions
const selectedManagement = computed(() => $store.gerenciaSelected)
const formatManagerName = computed(() => {
  return (fullName: string): string => {
    if (!fullName) return ''

    const words = fullName.split(' ')
    return words.slice(0, 2).join(' ')
  }
})

// Que gerencias ya firmaron la semana. Se pide una vez para todo el riel y no
// una por chip: un auditor con seis gerencias haria seis llamadas al entrar.
const cerradas = ref<Set<string>>(new Set())

// Cual chip esta trayendo sus agencias. Se guarda el id y no un booleano para
// que la senal salga en el chip que se toco, no en todo el riel.
const cargando = ref<string | null>(null)

async function cargarEstadoDeCierre() {
  const ids = props.gerencias.map((g) => g.gerencia).filter(Boolean)
  const { year, week } = $store.currentDate
  if (!ids.length || !year || !week) return

  try {
    const { data } = await commonService.getEstadoCierres(ids, year, week)
    cerradas.value = new Set(
      (data?.data ?? []).filter((e) => e.cerrada).map((e) => e.gerencia)
    )
  } catch {
    // El estado de cierre es informativo: si no llega, el riel funciona igual
    // sin palomitas. No vale interrumpir al usuario por esto.
    cerradas.value = new Set()
  }
}

watch(
  () => [props.gerencias, $store.currentDate.week, $store.currentDate.year],
  cargarEstadoDeCierre,
  { immediate: true, deep: true }
)

// Methods
async function selectManagement(managementId: string, navigateToDashboard = false) {
  // Update selected management in the store
  $store.gerenciaSelected = managementId
  $store.loading = true
  cargando.value = managementId

  try {
    // Fetch agencies for the selected management
    const response = await commonService.getAgenciesCopy(managementId)
    $store.agencies = response.data

    // Reset agency data
    $store.resetAgencyData()

    // Navigate to dashboard if requested
    if (navigateToDashboard) {
      $router.push({
        name: ROUTE_NAME.DASHBOARD_GERENCY
      })
    }
  } catch (error) {
    showError('Error al cargar los datos')
  } finally {
    $store.loading = false
    cargando.value = null
  }
}
</script>

<template>
  <!--
    El riel son pestañas y nada más. Antes cada gerencia arrastraba un segundo
    botón idéntico al chip pero con otro efecto -abría la ficha, y de paso
    cambiaba la gerencia activa y sacaba de la pantalla-: dos formas iguales para
    dos acciones distintas, repetidas tantas veces como gerencias hubiera.

    Ahora la ficha vive dentro del chip seleccionado y solo ahí, separada por una
    línea. Es un objeto con dos zonas, no dos botones gemelos: el tamaño y el
    peso dicen cuál manda. Sacarla del riel no funcionó -quedaba pegada al
    degradado del borde y parecía taparlo, además de comerse el ancho, que en
    teléfono es lo que escasea-.

    `min-w-0` porque el riel comparte renglón con el botón del menú: sin él el
    ancho de todas las gerencias empujaría la fila fuera de la pantalla.
  -->
  <ul class="chip-rail min-w-0 space-x-3">
    <li v-for="(management, index) in gerencias" :key="`management-${index}`" class="flex-shrink-0">
      <div
        :class="[
          management.gerencia === selectedManagement ? 'bg-slate-700 text-white' : 'bg-white',
          'relative flex items-stretch overflow-hidden rounded-xl border shadow-md transition-opacity duration-150',
          management.gerencia === selectedManagement ? 'con-muesca' : '',
          cargando === management.gerencia ? 'opacity-60' : ''
        ]"
        :aria-busy="cargando === management.gerencia ? 'true' : undefined"
      >
        <!-- Acuse inmediato del toque: traer las agencias tarda lo suficiente
             para que sin esto parezca que no paso nada. Una linea de 2px que
             recorre el chip alcanza; un spinner encima seria mas ruido que
             informacion en un control de este tamano. -->
        <span
          v-if="cargando === management.gerencia"
          class="barra-carga absolute inset-x-0 bottom-0 h-0.5 overflow-hidden"
          aria-hidden="true"
        />
        <button
          @click="() => selectManagement(management.gerencia)"
          class="flex cursor-pointer flex-col px-4 py-1.5 text-left text-[0.8rem]"
          :aria-label="`Seleccionar gerencia ${management.gerencia}`"
          :aria-current="management.gerencia === selectedManagement ? 'true' : undefined"
        >
          <span class="flex items-center gap-1.5 whitespace-nowrap">
            {{ management.gerencia }}
            <!-- Dice que esa gerencia ya firmó la semana. No bloquea nada:
                 seguir capturando después de firmar es normal y ocurre unas 700
                 veces por semana. Solo informa. -->
            <svg
              v-if="cerradas.has(management.gerencia)"
              class="h-3 w-3 flex-shrink-0"
              :class="management.gerencia === selectedManagement ? 'text-emerald-300' : 'text-emerald-600'"
              viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            >
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z" />
            </svg>
            <span v-if="cerradas.has(management.gerencia)" class="sr-only">— cierre firmado</span>
          </span>
          <span class="whitespace-nowrap text-[0.6rem] opacity-75">{{ formatManagerName(management.gerente) }}</span>
        </button>

        <!-- Solo en la seleccionada: la ficha únicamente tiene sentido para la
             gerencia que se está viendo. -->
        <!-- Muesca, como la perforacion de un boleto: dos mordidas redondas
             arriba y abajo, del tono del chip pero mas oscuro, que el
             `overflow-hidden` del contenedor recorta a la mitad. Dice "una sola
             pieza con dos partes" mejor que una linea, que lee como dos cajas
             pegadas. Se hace con el color del propio chip para no depender del
             fondo de la pantalla. -->
        <span
          v-if="management.gerencia === selectedManagement"
          class="my-2 w-px flex-shrink-0 bg-white/20"
          aria-hidden="true"
        />
        <button
          v-if="management.gerencia === selectedManagement"
          @click="() => selectManagement(management.gerencia, true)"
          class="flex cursor-pointer items-center px-2.5 text-white/70"
          :aria-label="`Ver detalles de la gerencia ${management.gerencia}`"
        >
          <!-- Chevron y no una "i": esto no muestra informacion en el lugar,
               navega a la ficha de la gerencia. El chevron es la senal que ya
               significa "lleva a otro lado"; la "i" prometia otra cosa. -->
          <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor"
               stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7.5 4.5L13 10l-5.5 5.5" />
          </svg>
        </button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
/*
  Muesca de boleto. Antes eran dos circulos pintados de un tono mas oscuro, y a
  la vista quedaban como manchas pegadas y no como una hendidura. Aqui el fondo
  se recorta de verdad con una mascara, asi que por el hueco se ve la pantalla:
  no hay color que acertar ni que mantener si cambia el fondo.

  La `x` es fija porque la zona del chevron tambien lo es -16px de icono mas
  10px de padding a cada lado-, asi que la muesca cae siempre sobre el divisor.
*/
.con-muesca {
  --muesca-x: 36px;
  --muesca-r: 5px;
  -webkit-mask-image:
    radial-gradient(circle var(--muesca-r) at calc(100% - var(--muesca-x)) 0, transparent calc(var(--muesca-r) - 0.5px), #000 var(--muesca-r)),
    radial-gradient(circle var(--muesca-r) at calc(100% - var(--muesca-x)) 100%, transparent calc(var(--muesca-r) - 0.5px), #000 var(--muesca-r));
  -webkit-mask-composite: source-in;
  mask-image:
    radial-gradient(circle var(--muesca-r) at calc(100% - var(--muesca-x)) 0, transparent calc(var(--muesca-r) - 0.5px), #000 var(--muesca-r)),
    radial-gradient(circle var(--muesca-r) at calc(100% - var(--muesca-x)) 100%, transparent calc(var(--muesca-r) - 0.5px), #000 var(--muesca-r));
  mask-composite: intersect;
}

.barra-carga::after {
  content: '';
  position: absolute;
  inset-block: 0;
  width: 40%;
  background: currentColor;
  opacity: 0.55;
  animation: recorre 900ms ease-in-out infinite;
}

@keyframes recorre {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}

/* Quien pidio menos movimiento recibe el mismo dato sin la animacion. */
@media (prefers-reduced-motion: reduce) {
  .barra-carga::after {
    animation: none;
    width: 100%;
    opacity: 0.35;
  }
}
</style>
