// Tipo principal de Pagaré (según la respuesta de la API)
export interface Pagare {
  id_sistemas: string
  folio: string
  prestamo_id: string
  gerencia: string
  fecha_entrega_pagare: string | null
  hora_entrega_pagare: string | null
  sucursal: string
  agencia: string
  nombre_agente: string
  monto_prestamo: number
  cargo: number
  total_a_pagar: number
  pago_semanal: number
  plazo: string
  cliente_nombre: string
  cliente_domicilio: string | null
  cliente_telefono: string | null
  aval_nombre: string | null
  entregado: number
  semaforo: string | null
  marca_folio: string | null
  created_at: string | null
}

// Payload para buscar pagarés por gerencia
export interface SearchPagaresPayload {
  filter: {
    type: 'rule'
    field: string
    operator: string
    value: string
  }
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}

// Payload para actualizar pagaré
export interface ActualizarPagarePayload {
  lugar_entrega?: string
  observaciones?: string
  entregado?: boolean | number
  fecha_entrega_pagare?: string
  nombre_quien_recibio?: string
  parentesco_quien_recibio?: string
  semaforo?: string
  marca_folio?: string
  entregado_cliente_at?: string
  entregado_cliente_by?: string
  recibido_oficina_at?: string
  recibido_oficina_by?: string
}
