import { ref } from 'vue'
import type VueBottomSheet from '@webzlodimir/vue-bottom-sheet'

/**
 * Composable para manejar bottom sheets de manera reutilizable
 * @returns Objeto con métodos para controlar bottom sheets
 */
export function useBottomSheet() {
  // Referencias a los bottom sheets
  const bottomSheetRef = ref<InstanceType<typeof VueBottomSheet> | undefined>()

  /**
   * Abre el bottom sheet
   */
  const openBottomSheet = () => {
    bottomSheetRef.value?.open()
  }

  /**
   * Cierra el bottom sheet
   */
  const closeBottomSheet = () => {
    bottomSheetRef.value?.close()
  }

  /**
   * Verifica si el bottom sheet está abierto
   */
  const isBottomSheetOpen = (): boolean => {
    return bottomSheetRef.value?.isOpen() ?? false
  }

  return {
    // Referencias
    bottomSheetRef,
    
    // Métodos
    openBottomSheet,
    closeBottomSheet,
    isBottomSheetOpen
  }
}

/**
 * Tipo para múltiples bottom sheets
 */
export type BottomSheetRef = InstanceType<typeof VueBottomSheet> | undefined

/**
 * Composable para manejar múltiples bottom sheets
 * @param sheetNames Array de nombres para identificar cada bottom sheet
 * @returns Objeto con métodos para controlar múltiples bottom sheets
 */
export function useMultipleBottomSheets(sheetNames: string[]) {
  const bottomSheets = ref<Record<string, BottomSheetRef>>({})
  
  /**
   * Registra una referencia de bottom sheet
   * @param name Nombre del bottom sheet
   * @param ref Referencia del componente
   */
  const registerBottomSheet = (name: string, ref: BottomSheetRef) => {
    bottomSheets.value[name] = ref
  }

  /**
   * Abre un bottom sheet específico
   * @param name Nombre del bottom sheet
   */
  const openBottomSheet = (name: string) => {
    bottomSheets.value[name]?.open()
  }

  /**
   * Cierra un bottom sheet específico
   * @param name Nombre del bottom sheet
   */
  const closeBottomSheet = (name: string) => {
    bottomSheets.value[name]?.close()
  }

  /**
   * Cierra todos los bottom sheets
   */
  const closeAllBottomSheets = () => {
    Object.values(bottomSheets.value).forEach(sheet => {
      sheet?.close()
    })
  }

  return {
    // Referencias
    bottomSheets,
    
    // Métodos
    registerBottomSheet,
    openBottomSheet,
    closeBottomSheet,
    closeAllBottomSheets
  }
} 