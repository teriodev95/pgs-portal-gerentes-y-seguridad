export const REPORT_CONFIG = {
  API_BASE: 'https://img-reporte.xpress1.cc/api/reportes',
  API_MANAGEMENT_ENDPOINT: '/generar',
  API_AGENCY_ENDPOINT: '/agencias/generar',
  API_KEY: 'qfxS8ABtPvft0YI4PPxjvYvXOgcKeeWwUOv2LLTgDAI=',
  DEFAULT_FILE_TYPE: 'image/png',
  REQUEST_HEADERS: {
    'Content-Type': 'application/json',
  },
  TIMEOUT: 60000, // 60 seconds
} as const

export const REPORT_MESSAGES = {
  GENERATION_SUCCESS: 'Reporte generado correctamente',
  SHARE_SUCCESS: 'Reporte compartido exitosamente',
  DOWNLOAD_SUCCESS: 'Reporte descargado correctamente',
  GENERATION_IN_PROGRESS: 'Generando reporte...',
  SHARE_IN_PROGRESS: 'Compartiendo reporte...',
} as const

export const SPANISH_DAYS = [
  'DOMINGO',
  'LUNES',
  'MARTES',
  'MIÉRCOLES',
  'JUEVES',
  'VIERNES',
  'SÁBADO'
] as const