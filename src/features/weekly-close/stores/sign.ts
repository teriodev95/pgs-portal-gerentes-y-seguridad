import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORE_NAME = 'sign'

/**
 * useSignStore
 */
export const useSignStore = defineStore(STORE_NAME, () => {
  /**
   * ------------------------------------------
   *	Data
   * ------------------------------------------
   */

  const firmaAgente = ref<string>('')
  const firmaGerente = ref<string>('')
  const nombreAgente = ref<string>()
  const nombreGerente = ref<string>()
  const uidVerificacionAgente = ref<string>('')
  const uidVerificacionGerente = ref<string>('')
  const urlFirmaAgente = ref<string>()
  const urlFirmaGerente = ref<string>()
  const verificacionCompletadaAgente = ref<boolean>(false)
  const verificacionCompletadaGerente = ref<boolean>(false)

  const verificationCompletadaTotal = () => {
    return (
      verificacionCompletadaAgente.value &&
      verificacionCompletadaGerente.value &&
      firmaAgente.value &&
      firmaGerente.value
    )
  }

  const resetValues = () => {
    firmaAgente.value = ''
    firmaGerente.value = ''
    nombreAgente.value = ''
    nombreGerente.value = ''
    uidVerificacionAgente.value = ''
    uidVerificacionGerente.value = ''
    urlFirmaAgente.value = ''
    urlFirmaGerente.value = ''
    verificacionCompletadaAgente.value = false
    verificacionCompletadaGerente.value = false
  }

  return {
    // Data
    firmaAgente,
    firmaGerente,
    nombreAgente,
    nombreGerente,
    uidVerificacionAgente,
    uidVerificacionGerente,
    urlFirmaAgente,
    urlFirmaGerente,
    verificacionCompletadaAgente,
    verificacionCompletadaGerente,

    // Methods
    resetValues,
    verificationCompletadaTotal
  }
})
