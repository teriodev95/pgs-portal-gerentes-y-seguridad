// ============================================================================
// El tramo del ciclo que le toca al gerente
// ============================================================================
//
// Espejo de lo que devuelve `GET /pagares/pendientes` en Elysia. Los nombres
// vienen en snake_case tal cual del backend: traducirlos aqui obligaria a
// mantener dos vocabularios para el mismo dato.

/** Un pagare que el gerente tiene en su poder y todavia no retorna a oficina. */
export interface PagarePendiente {
  prestamo_id: string
  /** La llave con la que se registra la entrega: `PATCH /pagares/by-id-sistemas/:id`. */
  id_sistemas: string
  folio: string | null
  cliente_nombre: string | null
  cliente_domicilio: string | null
  cliente_telefono: string | null
  agencia: string | null
  semana_liquidacion: number | null
  anio_liquidacion: number | null
  folio_solicitud: string | null
  entregado_ger_at: string
  semaforo: string | null
  // Lo que el gerente captura al entregar. Si `nombre_quien_recibio` viene lleno,
  // la entrega ya se registro y el pagare solo espera a que oficina lo cierre.
  nombre_quien_recibio: string | null
  parentesco_quien_recibio: string | null
  fecha_entrega_pagare: string | null
  observaciones: string | null
  entregado_cliente_at: string | null
  entregado_cliente_by: string | null
}

export interface PendientesGerencia {
  gerencia: string
  total: number
  /**
   * Entregados a esta gerencia desde que existe el sistema. Distingue al gerente
   * que ya retorno todo del que nunca ha recibido nada, que en pantalla se ven
   * igual: los dos con la lista vacia.
   */
  entregados_historicos: number
  por_anio: Array<{ anio: number; total: number }>
  pagares: PagarePendiente[]
}

/**
 * Lo que el gerente escribe al entregarle el pagare al cliente.
 *
 * No lleva `semaforo` ni `recibido_oficina_at`: el semaforo lo decide oficina al
 * cotejar el talon, y esa fecha es la unica que cierra el pagare. Si la PWA la
 * mandara, el pagare desapareceria de Pendientes sin que nadie revisara el papel.
 */
export interface RegistrarEntregaPayload {
  nombre_quien_recibio: string
  parentesco_quien_recibio?: string
  fecha_entrega_pagare?: string
  observaciones?: string
  entregado: boolean
  entregado_cliente_at: string
  entregado_cliente_by: string
}
