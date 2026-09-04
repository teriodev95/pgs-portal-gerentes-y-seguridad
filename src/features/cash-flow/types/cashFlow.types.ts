// Espejo de Elysia GET /api/flujo-efectivo/:gerencia/:anio/:semana.
// Misma fuente que el Arqueo de Flujo en MOX y el reporte diario en PNG.

export type Rol = 'Agente' | 'Gerente' | 'Custodio' | 'Oficina' | 'Desconocido'

export interface Persona {
  id: number | null
  nombre: string
  tipo: string | null
  rol: Rol
}

export interface Cubos {
  cobranza_total: number
  primer_pagos: number
  otros_ingresos: number
  recibido_otras_gerencias: number
  fondeo_oficina: number
  entregado_oficina: number
  en_campo: number
  con_gerente: number
  en_custodia: number
  en_oficina: number
  gastado: number
  enviado_otras_gerencias: number
  efectivo_a_entregar: number
  entradas: number
  ubicaciones: number
  sin_cuadrar: number
}

export interface Tramo {
  asignacion_id: string
  de: Persona
  a: Persona
  monto: number
  hora: string
  tipo: string
  origen_id: string | null
  relevo: boolean
  abierto: boolean
}

export interface Cadena {
  agencia: string
  agente: string | null
  cobranza: number
  entregado: number
  en_campo: number
  cerrada: boolean
  vacante: boolean
  tramos: Tramo[]
}

export type RubroEgreso =
  | 'ventas'
  | 'gastos'
  | 'comisiones_cobranza'
  | 'comisiones_ventas'
  | 'bonos'
  | 'incidentes'

export interface PartidaEgreso {
  rubro: RubroEgreso
  concepto: string
  monto: number
  registro_id: string | null
}

export interface Egresos {
  ventas: number
  gastos: number
  comisiones_cobranza: number
  comisiones_ventas: number
  bonos: number
  incidentes: number
  total: number
  partidas: PartidaEgreso[]
}

export interface FlujoEfectivo {
  gerencia: string
  anio: number
  semana: number
  generado_en: string
  cubos: Cubos
  egresos: Egresos
  cadenas: Cadena[]
}

export interface FlujoEfectivoResponse {
  success: boolean
  data: FlujoEfectivo
}
