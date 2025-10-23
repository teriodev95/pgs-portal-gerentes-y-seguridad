import type { Ref } from "vue"

export interface ReportParams {
  managementId: string
  week: number
  year: number
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