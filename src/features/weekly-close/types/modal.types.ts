export type ModalValue = number | string | undefined

export interface ModalConfig {
  label: string
  value: ModalValue
}

export type ModalConfigKey =
  | 'bonos'
  | 'motivoOtrosEA'
  | 'multas'
  | 'otrosEgresosAgente'
  | 'efectivoEntregado'
  | 'asignacionesPrevias'

export type AllConfig = Record<ModalConfigKey, ModalConfig>