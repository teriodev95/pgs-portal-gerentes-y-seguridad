import { onUnmounted, ref } from 'vue'

/**
 * Composable genérico para manejar el estado de un drawer
 * Usa el patrón de estado compartido (singleton) cuando se pasa una key única
 *
 * @template T - Tipo del dato que puede ser seleccionado/mostrado en el drawer
 * @param key - Clave única para identificar el drawer (crea un estado compartido por key)
 * @returns Objeto con estado y métodos para controlar el drawer
 *
 * @example
 * // En tu store o composable
 * const incidentDrawer = useDrawer<IIncident>('incident')
 *
 * // Abrir drawer vacío
 * incidentDrawer.open()
 *
 * // Abrir drawer con datos
 * incidentDrawer.openWith(incident)
 *
 * // Verificar si tiene datos
 * if (incidentDrawer.hasData.value) { ... }
 */

// Cache de estados por key para implementar singleton pattern
const drawerStates = new Map<string, {
  isOpen: ReturnType<typeof ref<boolean>>
  selectedData: ReturnType<typeof ref<any>>
}>()

export function useDrawer<T = unknown>(key: string) {
  // Obtener o crear el estado para esta key
  if (!drawerStates.has(key)) {
    drawerStates.set(key, {
      isOpen: ref(false),
      selectedData: ref<T | undefined>()
    })
  }

  const state = drawerStates.get(key)!
  const isOpen = state.isOpen as ReturnType<typeof ref<boolean>>
  const selectedData = state.selectedData as ReturnType<typeof ref<T | undefined>>

  /**
   * Abre el drawer sin datos
   */
  function open() {
    isOpen.value = true
  }

  /**
   * Cierra el drawer
   */
  function close() {
    isOpen.value = false
  }

  /**
   * Abre el drawer con datos específicos
   */
  function openWith(data: T) {
    selectedData.value = data
    open()
  }

  /**
   * Resetea el drawer (cierra y limpia datos)
   */
  function reset() {
    selectedData.value = undefined
    close()
  }

  /**
   * Establece los datos sin abrir el drawer
   */
  function setData(data: T | undefined) {
    selectedData.value = data
  }

  /**
   * Limpia los datos sin cerrar el drawer
   */
  function clearData() {
    selectedData.value = undefined
  }

  /**
   * Toggle del estado del drawer
   */
  function toggle() {
    isOpen.value = !isOpen.value
  }

  onUnmounted(() => {
    selectedData.value = undefined
    isOpen.value = false
  })

  return {
    // Estado
    isOpen,
    selectedData,

    // Computed helpers
    hasData: ref(selectedData.value !== undefined),

    // Métodos
    open,
    close,
    openWith,
    reset,
    setData,
    clearData,
    toggle,
  }
}
