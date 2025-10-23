export type ModalValue = number | string | undefined

export interface ModalConfig {
  label: string
  value: ModalValue
}

export type ModalConfigKey =
  | 'bonos'
  | 'motivoOtrosEA'
  | 'motivoOtrosIA'
  | 'multas'
  | 'otrosEgresosAgente'
  | 'otrosIngresosAgente'
  | 'efectivoEntregado'
  | 'asignacionesPrevias'

export type AllConfig = Record<ModalConfigKey, ModalConfig>