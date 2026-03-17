import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORE_NAME = 'sign'

/**
 * Sign store for weekly close verification
 *
 * Stores signature data, verification URLs, and completion status
 * for both agent and manager verification flows
 */
export const useSignStore = defineStore(STORE_NAME, () => {
  /**
   * ------------------------------------------
   *	Signature Data
   * ------------------------------------------
   */

  // Agent signature data
  const agentSignature = ref<string>('')
  const agentName = ref<string>()
  const agentVerificationVideoUrl = ref<string>('')
  const agentSignatureUrl = ref<string>()
  const isAgentVerificationCompleted = ref<boolean>(false)

  // Manager signature data
  const managerSignature = ref<string>('')
  const managerName = ref<string>()
  const managerVerificationVideoUrl = ref<string>('')
  const managerSignatureUrl = ref<string>()
  const isManagerVerificationCompleted = ref<boolean>(false)

  // Special flags
  const canCloseWithoutSigning = ref<boolean>(false)

  /**
   * ------------------------------------------
   *	Methods
   * ------------------------------------------
   */

  /**
   * Checks if full verification is completed
   * Requires both agent and manager to have completed verification
   */
  const isFullVerificationCompleted = () => {
    return (
      isAgentVerificationCompleted.value &&
      isManagerVerificationCompleted.value &&
      agentSignature.value &&
      managerSignature.value
    )
  }

  /**
   * Resets all signature and verification data
   */
  const reset = () => {
    agentSignature.value = ''
    agentName.value = ''
    agentVerificationVideoUrl.value = ''
    agentSignatureUrl.value = ''
    isAgentVerificationCompleted.value = false

    managerSignature.value = ''
    managerName.value = ''
    managerVerificationVideoUrl.value = ''
    managerSignatureUrl.value = ''
    isManagerVerificationCompleted.value = false

    canCloseWithoutSigning.value = false
  }

  return {
    // Agent data
    agentSignature,
    agentName,
    agentVerificationVideoUrl,
    agentSignatureUrl,
    isAgentVerificationCompleted,

    // Manager data
    managerSignature,
    managerName,
    managerVerificationVideoUrl,
    managerSignatureUrl,
    isManagerVerificationCompleted,

    // Flags
    canCloseWithoutSigning,

    // Methods
    reset,
    isFullVerificationCompleted
  }
})
