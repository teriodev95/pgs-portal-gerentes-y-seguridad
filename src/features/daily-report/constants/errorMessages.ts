export const REPORT_ERROR_MESSAGES = {
  REPORT_GENERATION_FAILED: 'Error al generar el reporte',
  REPORT_SHARE_FAILED: 'Error al compartir el reporte',
  REPORT_DOWNLOAD_FAILED: 'Error al descargar el reporte',
  API_ERROR: 'Error en el servidor al procesar la solicitud',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNAUTHORIZED_ERROR: 'No tienes permisos para realizar esta acción',
  FORBIDDEN_ERROR: 'Acceso denegado al servicio de reportes',
  SERVER_ERROR: 'Error interno del servidor. Intente nuevamente',
  EMPTY_RESPONSE_ERROR: 'El servidor devolvió una respuesta vacía',
  INVALID_PARAMS_ERROR: 'Parámetros del reporte inválidos',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type ReportErrorType = keyof typeof REPORT_ERROR_MESSAGES