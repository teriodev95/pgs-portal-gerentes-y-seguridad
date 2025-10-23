export interface IIncidentFormData {
  categoria: 'incidente' | 'reposicion' | 'nomina'
  tipo: 'ingreso' | 'egreso'
  comentario: string
  monto: number
}

export interface IIncident extends IIncidentFormData {
  id?: number
  anio: number
  fecha: string
  gerencia: string
  usuarioId: number
  semana: number
}
