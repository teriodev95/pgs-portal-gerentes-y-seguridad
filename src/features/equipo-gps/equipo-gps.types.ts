// Contrato de FAX `GET /api/rastreo/monitor/equipo` y `/equipo/:id/hoy` (xpress-fax, monitor/equipo.py).
// Es chico a propósito: se abre en Android de gama baja con datos móviles.

export type EstadoGerente =
  | 'activo' // captura de hace 10 min o menos
  | 'sin_senal' // hoy y en horario, pero la última captura ya es vieja
  | 'sin_hoy' // nada capturado hoy
  | 'fuera_horario' // su última captura queda fuera de 07:00–20:00: no viaja la ubicación
  | 'sin_app' // nunca ha entrado a la app de rastreo
  | 'vacante' // la gerencia no tiene gerente activo

export interface UbicacionGerente {
  lat: number
  lon: number
  precision_m: number
  bateria: number | null
  registrado_at: string
}

export interface GerenteEquipo {
  id: number | null
  nombre: string | null
  usuario: string | null
  gerencia: string
  /** Código de sucursal de la gerencia (GERC, GERD, GERDC, GERE, GERGC, GERM, GERP). */
  sucursal: string | null
  /** Color que Oficina guardó en MOX; null = el color por defecto de la sucursal (`colorDe`). */
  color: string | null
  estado: EstadoGerente
  ubicacion: UbicacionGerente | null
}

export interface EquipoRespuesta {
  gerentes: GerenteEquipo[]
  /** Sucursales permitidas a quien mira (de sus gerencias y usuarios_sucursales): los chips salen de aquí. */
  sucursales: string[]
  fecha: string
  desde: string
  hasta: string
  server_time: string
}

/** [lat, lon, registrado_at ISO, precisión en metros] */
export type Vertice = [number, number, string, number]

export interface RecorridoHoy {
  user_id: number
  fecha: string
  desde: string
  hasta: string
  /** 10 dígitos del celular del gerente, o null si no está en su ficha. */
  telefono: string | null
  /** `estimado`: [desde, hasta, segundos] de los tramos sin puntos en medio (>800 m o >120 s en movimiento). */
  tramos: { puntos: Vertice[]; estimado?: [string, string, number][] }[]
  paradas: { lat: number; lon: number; inicio: string; fin: string; segundos: number }[]
  huecos: { desde: string; hasta: string; segundos: number }[]
  resumen: { distancia_m: number; puntos: number; paradas: number }
  server_time: string
}

/** Respuesta de `/equipo/:id/hoy?resumen=1`: la ficha del mapa, sin puntos de ruta (< 1 KB). */
export interface ResumenHoy {
  user_id: number
  fecha: string
  telefono: string | null
  /** Primera captura del día en horario, o null. */
  inicio: string | null
  bateria: number | null
  resumen: { distancia_m: number; puntos: number; paradas: number; huecos: number }
  ahora: {
    estado: 'detenido' | 'en_movimiento' | 'sin_senal' | 'sin_datos'
    desde: string | null
    segundos: number | null
    cerca_ultima_parada: boolean
  }
  server_time: string
}

/** Filtro de la lista: los tres botones con conteo. */
export type FiltroEquipo = 'todos' | 'activos' | 'sin_senal'

/** Un marcador del modo Mapa: una persona o un grupo de personas encimadas en pantalla. */
export interface MarcadorMapa {
  lat: number
  lon: number
  gerentes: GerenteEquipo[]
}

/** Una fila de la línea del día en el panel del detalle. */
export interface EventoDia {
  tipo: 'inicio' | 'parada' | 'hueco' | 'fin'
  titulo: string
  detalle: string
  /** Dónde centrar el mapa al tocar la fila; un hueco no tiene lugar. */
  lugar: [number, number] | null
}
