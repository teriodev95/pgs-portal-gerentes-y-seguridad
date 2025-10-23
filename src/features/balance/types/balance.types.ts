export interface IBalance {
  ingresosPorAsignaciones: number
  ingresosPorPrimerosPagos: number
  ingresosPorCierres: number
  ingresosPorIncidentesYReposiciones: number

  // Egresos
  egresosPorAsignaciones: number
  egresosPorVentas: number
  egresosPorComisionDeCobranza: number
  egresosPorComisionDeVentas: number
  egresosPorGastos: number
  egresosPorIncidentesYReposiciones: number

  // Totales
  totalIngresos: number
  totalEgresos: number
  balance: number
}