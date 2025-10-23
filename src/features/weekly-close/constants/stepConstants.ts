// Step navigation constants for the weekly close process
export enum STEPS {
  HOME = 0,
  AGENT_PIN_CAMERA = 1,
  GERENT_PIN_CAMERA = 2
}

// Step labels and descriptions
export const STEP_LABELS = {
  [STEPS.HOME]: 'Inicio',
  [STEPS.AGENT_PIN_CAMERA]: 'Verificación Agente',
  [STEPS.GERENT_PIN_CAMERA]: 'Verificación Gerente'
} as const

// Step descriptions for UI
export const STEP_DESCRIPTIONS = {
  [STEPS.HOME]: 'Resumen del cierre semanal',
  [STEPS.AGENT_PIN_CAMERA]: 'Verificación PIN y video del agente',
  [STEPS.GERENT_PIN_CAMERA]: 'Verificación PIN y video del gerente'
} as const

// Step validation requirements
export const STEP_REQUIREMENTS = {
  [STEPS.HOME]: [],
  [STEPS.AGENT_PIN_CAMERA]: ['pin', 'video', 'signature'],
  [STEPS.GERENT_PIN_CAMERA]: ['pin', 'video', 'signature']
} as const

// Step flow configuration
export const STEP_FLOW = {
  NEXT_STEP: {
    [STEPS.HOME]: STEPS.AGENT_PIN_CAMERA,
    [STEPS.AGENT_PIN_CAMERA]: STEPS.GERENT_PIN_CAMERA,
    [STEPS.GERENT_PIN_CAMERA]: STEPS.HOME
  },
  PREVIOUS_STEP: {
    [STEPS.HOME]: STEPS.HOME,
    [STEPS.AGENT_PIN_CAMERA]: STEPS.HOME,
    [STEPS.GERENT_PIN_CAMERA]: STEPS.HOME
  }
} as const

// User types for step validation
export const USER_TYPES = {
  AGENT: 'agente',
  MANAGER: 'gerente',
  SECURITY: 'seguridad'
} as const

export type StepType = keyof typeof STEP_LABELS
export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES]