// Tipo principal de Pagaré (según la respuesta de la API)
export interface Pagare {
  id?: number
  id_sistemas: string
  folio: string
  prestamo_id: string
  gerencia: string
  fecha_entrega_pagare: string | null
  hora_entrega_pagare: string | null
  sucursal: string
  agencia: string
  nombre_agente: string
  lugar_entrega: string | null
  monto_prestamo: number
  cargo: number
  total_a_pagar: number
  primer_pago: number
  pago_semanal: number
  plazo: string
  tipo_credito: string
  dia_de_pago: string
  semana_inicio: number
  anio_inicio: number
  cliente_nombre: string
  cliente_domicilio: string | null
  cliente_telefono: string | null
  aval_nombre: string | null
  aval_domicilio: string | null
  aval_telefono: string | null
  nombre_quien_recibio: string | null
  parentesco_quien_recibio: string | null
  entregado_cliente_at: string | null
  entregado_cliente_by: string | null
  recibido_oficina_at: string | null
  recibido_oficina_by: string | null
  entregado: number
  semaforo: string | null
  marca_folio: string | null
  observaciones: string | null
  created_at: string | null
  created_by: string | null
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
