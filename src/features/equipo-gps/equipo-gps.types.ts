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
  estado: EstadoGerente
  ubicacion: UbicacionGerente | null
}

export interface EquipoRespuesta {
  gerentes: GerenteEquipo[]
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
  tramos: { puntos: Vertice[] }[]
  paradas: { lat: number; lon: number; inicio: string; fin: string; segundos: number }[]
  huecos: { desde: string; hasta: string; segundos: number }[]
  resumen: { distancia_m: number; puntos: number; paradas: number }
  server_time: string
}
