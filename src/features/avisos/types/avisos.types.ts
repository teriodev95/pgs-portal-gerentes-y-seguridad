/** Contrato v1 de `GET /api/avisos` en Elysia (SOLIM/notes/spec-buzon-avisos-pgs.md). */
export type AvisoPrioridad = 'alta' | 'normal'
export type AvisoEvento = 'aprobada' | 'aprobada_con_ajuste' | 'rechazada' | 'correccion'

export interface AvisoCorreccion {
  id: string
  motivo: string | null
  instruccion: string | null
  temas: string[]
  solicitada_por: string | null
  created_at: string | null
  /** retirada = oficina la retiró. */
  estado: 'abierta' | 'corregida' | 'retirada'
  corregida_at: string | null
}

export interface Aviso {
  id: number | string
  solicitud_id: string
  evento: AvisoEvento
  prioridad: AvisoPrioridad
  titulo: string
  detalle: string | null
  cta_label: string | null
  cta_url: string | null
  leido_at: string | null
  created_at: string
  status_solicitud: string | null
  cliente_nombre: string | null
  agencia: string | null
  correccion?: AvisoCorreccion | null
  /** En vivo: sigue pidiendo algo hoy al usuario. */
  requiere_accion: boolean
  /** Vistos buenos que faltan, por rol (lo agrega Elysia). */
  vistos_buenos_faltantes?: string[]
}

export type AvisosVista = 'pendientes' | 'historial'

export interface AvisosResponse {
  data: Aviso[]
  no_leidos: number
  /** Cursor de la página siguiente (`?antes=`); null si no hay más. */
  siguiente: string | null
}
