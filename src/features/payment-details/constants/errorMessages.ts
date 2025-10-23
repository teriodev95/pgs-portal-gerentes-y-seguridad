export const PAYMENT_HISTORY_ERROR_MESSAGES = {
  LOAD_FAILED: 'Error al cargar el historial del préstamo',
  LOAN_LOAD_FAILED: 'Error al cargar los datos del préstamo',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export const MAP_PAYMENT_ERROR_MESSAGES = {
  FETCH_ERROR: 'Error al cargar datos de pagos',
  MAP_INIT_ERROR: 'Error al inicializar el mapa',
  MAPBOX_TOKEN_ERROR: 'Token de Mapbox no válido',
  GEOLOCATION_ERROR: 'Error al obtener la ubicación',
  NETWORK_ERROR: 'Error de conexión a internet',
  DATA_PROCESSING_ERROR: 'Error al procesar los datos',
  HEATMAP_ERROR: 'Error al generar el mapa de calor',
  MARKER_ERROR: 'Error al cargar marcadores en el mapa'
} as const

export type PaymentHistoryErrorType = keyof typeof PAYMENT_HISTORY_ERROR_MESSAGES
export type MapPaymentErrorType = keyof typeof MAP_PAYMENT_ERROR_MESSAGES