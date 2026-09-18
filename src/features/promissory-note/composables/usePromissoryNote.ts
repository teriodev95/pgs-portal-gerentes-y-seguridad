import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import { ROUTE_NAME } from '@/router'
import { promissoryNoteService } from '../services/promissory-note.service'
import type { PagarePendiente, PendientesGerencia } from '../types'

/** Arriba de esto la lista deja de recorrerse con el pulgar y necesita buscador. */
const UMBRAL_BUSCADOR = 6

const sinAcentos = (valor: string) =>
  valor.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Una entrega esta registrada cuando ya se sabe quien recibio el pagare. */
const yaRegistrado = (pagare: PagarePendiente) => !!pagare.nombre_quien_recibio?.trim()

export interface GrupoAgencia {
  agencia: string
  pagares: PagarePendiente[]
}

export function usePromissoryNote() {
  const store = useStore()
  const $router = useRouter()

  const pendientes = ref<PendientesGerencia | null>(null)
  const loading = ref(true)
  const busqueda = ref('')
  const selectedPagare = ref<PagarePendiente | null>(null)

  const todos = computed<PagarePendiente[]>(() => pendientes.value?.pagares ?? [])

  const filtrados = computed(() => {
    const termino = sinAcentos(busqueda.value).trim()
    if (!termino) return todos.value

    return todos.value.filter((pagare) =>
      [pagare.cliente_nombre, pagare.folio, pagare.agencia, pagare.cliente_domicilio]
        .some((campo) => campo && sinAcentos(campo).includes(termino))
    )
  })

  const porEntregar = computed(() => filtrados.value.filter((p) => !yaRegistrado(p)))
  const registrados = computed(() => filtrados.value.filter(yaRegistrado))

  /**
   * Los pendientes van agrupados por agencia y no por fecha porque asi es la ruta
   * del gerente en campo: recorre una agencia completa antes de moverse a la otra.
   */
  const gruposPorEntregar = computed<GrupoAgencia[]>(() => {
    const grupos = new Map<string, PagarePendiente[]>()
    for (const pagare of porEntregar.value) {
      const agencia = pagare.agencia ?? 'Sin agencia'
      const lista = grupos.get(agencia) ?? []
      lista.push(pagare)
      grupos.set(agencia, lista)
    }
    return [...grupos.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([agencia, pagares]) => ({ agencia, pagares }))
  })

  /**
   * Cuantos pagares hay a cada nombre, para avisarlo en la tarjeta.
   *
   * Hoy 121 clientes traen dos o mas pagares a la vez, y el gerente que marca uno
   * creyendo que cubrio los dos deja el otro sin registrar. Se cuenta por nombre
   * porque es lo que trae la lista; si son homonimos el aviso tambien sirve, y por
   * eso dice "a este nombre" y no "de este cliente".
   */
  const pagaresPorNombre = computed(() => {
    const conteo = new Map<string, number>()
    for (const pagare of todos.value) {
      if (!pagare.cliente_nombre) continue
      const clave = sinAcentos(pagare.cliente_nombre)
      conteo.set(clave, (conteo.get(clave) ?? 0) + 1)
    }
    return conteo
  })

  const contarMismoNombre = (pagare: PagarePendiente) =>
    pagare.cliente_nombre ? pagaresPorNombre.value.get(sinAcentos(pagare.cliente_nombre)) ?? 1 : 1

  const mostrarBuscador = computed(() => todos.value.length > UMBRAL_BUSCADOR)

  /** Nunca recibio pagares vs ya los retorno todos: la lista vacia se lee igual. */
  const nuncaRecibio = computed(() => (pendientes.value?.entregados_historicos ?? 0) === 0)

  /**
   * La gerencia todavia no esta. `DashboardLayout` la resuelve en un
   * `onBeforeMount` asincrono que Vue no espera, asi que al recargar la app
   * parado en esta ruta el hijo monta antes. Sin distinguirlo, la pantalla
   * decia "oficina no te ha entregado pagares" a un gerente que trae veintidos.
   */
  const esperandoGerencia = computed(() => !store.gerenciaSelected)

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const loadPagares = async () => {
    if (!store.gerenciaSelected) return

    try {
      loading.value = true
      pendientes.value = await promissoryNoteService.getPendientes(store.gerenciaSelected)
    } catch (error) {
      console.error('Error al obtener pagarés:', error)
    } finally {
      loading.value = false
    }
  }

  // Se carga en cuanto hay gerencia, y se recarga si cambia. Un `onMounted` solo
  // corre una vez, y entonces depende de ganarle a esa carga; ademas dejaba la
  // lista de la gerencia anterior cuando seguridad o el regional cambian de una a
  // otra sin salir de la pantalla.
  watch(() => store.gerenciaSelected, loadPagares, { immediate: true })

  const handleSelectPagare = (pagare: PagarePendiente) => {
    selectedPagare.value = pagare
    scrollToTop()
  }

  const closeDetail = () => {
    selectedPagare.value = null
    scrollToTop()
  }

  /**
   * Tras registrar una entrega se recarga la lista: el pagare no desaparece
   * —solo oficina lo cierra— pero baja al bloque de registrados, y ese cambio de
   * lugar es el acuse de que se guardo.
   */
  const handleUpdated = async () => {
    await loadPagares()
  }

  const handleOnBack = () => {
    if (selectedPagare.value) {
      selectedPagare.value = null
      return
    }
    $router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
  }

  return {
    busqueda,
    closeDetail,
    contarMismoNombre,
    esperandoGerencia,
    gruposPorEntregar,
    handleOnBack,
    handleSelectPagare,
    handleUpdated,
    loadPagares,
    loading,
    mostrarBuscador,
    nuncaRecibio,
    porEntregar,
    registrados,
    selectedPagare,
    total: computed(() => todos.value.length)
  }
}
