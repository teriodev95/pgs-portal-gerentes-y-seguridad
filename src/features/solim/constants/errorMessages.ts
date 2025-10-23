export const SOLIM_ERROR_MESSAGES = {
  LOAN_REQUESTS_LOAD_FAILED: 'Error al cargar las solicitudes de préstamo',
  LOAN_REQUEST_APPROVAL_FAILED: 'Error al aprobar la solicitud de préstamo',
  LOAN_REQUEST_REJECTION_FAILED: 'Error al rechazar la solicitud de préstamo',
  LOAN_REQUEST_DETAILS_LOAD_FAILED: 'Error al cargar los detalles de la solicitud',
  INVALID_LOAN_REQUEST_DATA: 'Los datos de la solicitud no son válidos',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  UNAUTHORIZED_ACTION: 'No tiene permisos para realizar esta acción',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado'
} as const

export type SolimErrorType = keyof typeof SOLIM_ERROR_MESSAGES