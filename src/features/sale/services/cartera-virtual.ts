/**
 * Carteras virtuales (Charbel, 3-nov-2026): al registrar la venta se avisa si el cliente está en una
 * (agencia con problemas, en jurídico o con fraude). Es aviso, no bloqueo: el bloqueo duro lo pone
 * Elysia al aprobar el borrador. La regla vive en Elysia (GET /filtrado-clientes/cartera-virtual).
 */
export interface RespuestaCarteraVirtual {
  data?: { coincide: boolean; motivo: string }
}

export const TEXTO_VENTA_OK = 'La venta se ha creado exitosamente'

/** Texto secundario de la notificación de venta registrada: el aviso si coincide, el de siempre si no. */
export function textoAvisoCarteraVirtual(resp: RespuestaCarteraVirtual | null | undefined): string {
  const d = resp?.data
  if (!d?.coincide) return TEXTO_VENTA_OK
  return `Aviso: el cliente está en una cartera virtual (${d.motivo}). Oficina no podrá aprobar el crédito sin liberarlo.`
}
