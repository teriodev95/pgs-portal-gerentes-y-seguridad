// Colores semánticos por tipo de pago (Systemic Consistency: mismo mapa en
// tarjeta y drawer). Verde=cumplió, azul=dio de más, ámbar=parcial,
// rojo=faltó, morado=cerró crédito.
export const TIPO_PAGO_BADGE: Record<string, string> = {
  Pago: 'bg-green-100 text-green-800 border-green-200',
  Excedente: 'bg-blue-100 text-blue-800 border-blue-200',
  Reducido: 'bg-amber-100 text-amber-800 border-amber-200',
  No_pago: 'bg-red-100 text-red-700 border-red-200',
  Liquidacion: 'bg-purple-100 text-purple-800 border-purple-200',
  Multa: 'bg-orange-100 text-orange-800 border-orange-200',
  Visita: 'bg-gray-100 text-gray-600 border-gray-200',
  Adelantado: 'bg-teal-100 text-teal-800 border-teal-200'
}

export function tipoBadgeClass(tipo?: string | null): string {
  return TIPO_PAGO_BADGE[tipo ?? ''] ?? 'bg-gray-100 text-gray-600 border-gray-200'
}

export function tipoPagoLabel(tipo?: string | null): string {
  return (tipo ?? 'Sin tipo').replace(/_/g, ' ')
}
