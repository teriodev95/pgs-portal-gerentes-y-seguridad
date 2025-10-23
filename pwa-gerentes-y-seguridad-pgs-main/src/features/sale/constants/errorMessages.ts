export const SALE_ERROR_MESSAGES = {
  SALES_LOAD_FAILED: 'Error al cargar las ventas',
  SALE_SAVE_FAILED: 'Error al guardar la venta',
  SALE_INIT_FAILED: 'Error al inicializar el módulo de ventas',
  VALIDATION_ERROR: 'Datos de venta no válidos',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado',
  
  // Validation specific messages
  FECHA_REQUIRED: 'La fecha es requerida',
  AGENCIA_REQUIRED: 'La agencia es requerida',
  CLIENTE_REQUIRED: 'El nombre del cliente es requerido',
  TIPO_REQUIRED: 'El tipo es requerido',
  NIVEL_REQUIRED: 'El nivel es requerido',
  PLAZO_REQUIRED: 'El plazo es requerido',
  MONTO_INVALID: 'El monto debe ser mayor a 0',
  PRIMER_PAGO_INVALID: 'El primer pago debe ser mayor a 0',
  GERENCIA_REQUIRED: 'La gerencia es requerida',
  
  // Success messages
  SALE_CREATED_SUCCESS: 'Venta creada exitosamente',
  FORM_CLEARED_SUCCESS: 'Formulario limpiado correctamente'
} as const

export type SaleErrorMessageKey = keyof typeof SALE_ERROR_MESSAGES