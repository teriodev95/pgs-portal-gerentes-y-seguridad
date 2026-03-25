import type { CorrectionType } from '../types';

export const TYPE_LABELS: Record<CorrectionType, string> = {
  'asignacion': 'Asignación',
  'pago': 'Pago',
  'venta': 'Venta',
  'gasto': 'Gasto',
  'cierre_v2': 'Cierre',
  '': ''
} as const;

export const VALIDATION_MESSAGES = {
  INVALID_AMOUNT: 'Ingresa un monto válido mayor o igual a cero',
  INVALID_BONUS: 'El monto del bono debe ser mayor o igual a cero',
  INVALID_COLLECTION_COMMISSION: 'La comisión de cobro debe ser mayor or igual a cero',
  INVALID_SALES_COMMISSION: 'La comisión de ventas debe ser mayor o igual a cero'
} as const;
