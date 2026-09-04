import type { Ref } from "vue"

export interface ReportParams {
  managementId: string
  week: number
  year: number
}

/** Día para el que se generó el reporte; va en el texto al compartir. */
export interface ReportDay {
  name: string // JUEVES
  date: Date
}

export interface ShareResult {
  success: boolean
  method?: 'native' | 'download'
  error?: string
}

export type ReportType = 'gerencia' | 'agencia'

export interface ReportState {
  isGenerating: Ref<boolean>
  isSharing: Ref<boolean>
  filename: Ref<string>
  managementId: Ref<string>
  year: Ref<number>
  week: Ref<number>
  error: Ref<string>
  imageUrl: Ref<string>
  imageBlob: Ref<Blob | null>
}