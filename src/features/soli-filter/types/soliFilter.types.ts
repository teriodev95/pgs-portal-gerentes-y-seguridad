export type TipoCredito = 'nuevo' | 'renovacion'

export type SoliFilterResponseCode =
  | 'SOLICITUD_COMPLETA'
  | 'SOLICITUD_PARCIAL'
  | 'DOCUMENTOS_INVALIDOS'
  | 'TABLA_CARGOS_NO_ENCONTRADA'
  | 'ERROR_INTERNO'

export interface SoliFilterRequest {
  ineCliente: File
  comprobanteCliente: File
  ineAval: File
  comprobanteAval: File
  tablaCargosId: number
  agencia: string
  gerencia: string
  semana: number
  anio: number
  tipoCredito: TipoCredito
}

export interface DocumentoDetalle {
  documento: string
  valida: boolean
  url: string | null
  datos: Record<string, string> | null
  causa: string | null
  solucion: string | null
}

export interface DocumentoRepetir {
  campo: string
  documento: string
  causa: string
  solucion: string
}

export interface SoliFilterDocumentos {
  total: number
  leidos: number
  no_leidos: number
  detalle: DocumentoDetalle[]
}

export interface SoliFilterCredito {
  monto_solicitado: number
  plazo_semanas: number
  nivel: string
  total_pagar: number
  tarifa_semanal: number
}

export interface SoliFilterResponseData {
  id?: number
  nombre_cliente?: string
  nombre_aval?: string
  credito?: SoliFilterCredito
  documentos?: SoliFilterDocumentos
  documentos_a_repetir?: DocumentoRepetir[]
}

export interface SoliFilterResponse {
  success: boolean
  code: SoliFilterResponseCode
  message: string
  duration_ms?: number
  data: SoliFilterResponseData
}

// --- GET list response ---

export interface SoliFilterListItem {
  id: number
  persona_id_cliente: string | null
  persona_id_aval: string | null
  nombre_cliente: string
  nombre_aval: string
  tabla_cargos_id: number
  monto_solicitado: number
  plazo_semanas: number
  nivel: string
  tipo_credito: string
  agencia: string
  gerencia: string
  semana: number
  anio: number
  status: string
  created_by: string
  created_at: string
  updated_at: string
  documentos: SoliFilterListDocuments
  data: SoliFilterListMetadata
}

export interface SoliFilterListResponse {
  success: boolean
  code: string
  message: string
  duration_ms: number
  data: SoliFilterListItem[]
  count: number
}

export interface SoliFilterListDocumentDetail {
  valida: boolean
  url: string | null
  r2_key?: string | null
  datos_extraidos: Record<string, string | null> | null
  causa: string | null
  solucion: string | null
}

export interface SoliFilterOcrToken {
  doc: string
  input: number
  output: number
}

export interface SoliFilterSnapshot {
  monto_solicitado: number
  plazo_semanas: number
  nivel: string
  cargo: number
  total_pagar: number
  tarifa_semanal: number
  primer_pago: number
}

export interface SoliFilterListMetadata {
  solicitud_id_r2?: string
  tabla_cargos_snapshot?: SoliFilterSnapshot
  ocr_tokens?: SoliFilterOcrToken[]
}

export interface SoliFilterListDocuments {
  ine_cliente?: SoliFilterListDocumentDetail
  comprobante_cliente?: SoliFilterListDocumentDetail
  ine_aval?: SoliFilterListDocumentDetail
  comprobante_aval?: SoliFilterListDocumentDetail
  [key: string]: SoliFilterListDocumentDetail | undefined
}

// --- Tabla cargos catalog ---

export interface TablaCargosItem {
  id: number
  cargo_total_porcentaje: number
  monto_solicitado: number
  cargo: number
  total_pagar: number
  tarifa_semanal: number
  primer_pago: number
  nivel: string
  plazo_semanas: number
}

export interface TablaCargosResponse {
  success: boolean
  data: TablaCargosItem[]
}

// --- Photo config ---

export type PhotoField = 'ineCliente' | 'comprobanteCliente' | 'ineAval' | 'comprobanteAval'
export type PhotoVariant = 'blue' | 'green'

export interface PhotoConfig {
  field: PhotoField
  label: string
  description: string
  variant: PhotoVariant
}

export const PHOTO_CONFIGS_CLIENTE: PhotoConfig[] = [
  { field: 'ineCliente', label: 'INE', description: 'Credencial del cliente', variant: 'blue' },
  { field: 'comprobanteCliente', label: 'Comprobante', description: 'Domicilio del cliente', variant: 'green' },
]

export const PHOTO_CONFIGS_AVAL: PhotoConfig[] = [
  { field: 'ineAval', label: 'INE', description: 'Credencial del aval', variant: 'blue' },
  { field: 'comprobanteAval', label: 'Comprobante', description: 'Domicilio del aval', variant: 'green' },
]
