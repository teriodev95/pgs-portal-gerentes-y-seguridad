import type { ICreateCierreSemana, IWeeklyCloseWithIncome } from '../types'

export const transformToCreateCierre = (
  weeklyClose: IWeeklyCloseWithIncome,
  gerencia: string,
  uidVerificacionAgente: string,
  uidVerificacionGerente: string
): ICreateCierreSemana => {
  return {
    agencia: weeklyClose.resumenSemanal.agencia,
    agente: weeklyClose.resumenSemanal.agente,
    anio: weeklyClose.resumenSemanal.anio,
    asignaciones: weeklyClose.egresosAgente.asignacionesNumero,
    bonosPagadosEnSemana: weeklyClose.egresosGerente.bonosPagadosEnSemana,
    clientes: weeklyClose.resumenSemanal.clientes,
    clientesLiquidados: weeklyClose.resumenSemanal.clientesLiquidados,
    comisionCobranzaPagadaEnSemana: weeklyClose.egresosGerente.comisionCobranzaPagadaEnSemana,
    comisionVentasPagadaEnSemana: weeklyClose.egresosGerente.comisionVentasPagadaEnSemana,
    efectivoEntregadoCierre: weeklyClose.egresosAgente.efectivoEntregadoCierre,
    efectivoRestanteCierre: weeklyClose.egresosGerente.efectivoRestanteCierre,
    gerencia,
    gerente: weeklyClose.resumenSemanal.gerente,
    liquidaciones: weeklyClose.ingresosAgente.liquidaciones,
    motivoOtrosEgresos: weeklyClose.egresosAgente.motivoOtrosEgresos,
    motivoOtrosIngresos: weeklyClose.ingresosAgente.motivoOtrosIngresos,
    multas: weeklyClose.ingresosAgente.multas,
    noPagos: weeklyClose.resumenSemanal.noPagos,
    otrosEgresos: weeklyClose.egresosAgente.otrosEgresos,
    otrosIngresos: weeklyClose.ingresosAgente.otrosIngresos,
    pagosReducidos: weeklyClose.resumenSemanal.pagosReducidos,
    semana: weeklyClose.resumenSemanal.semana,
    porcentajePorBonoMensualPagadoEnSemana: weeklyClose.egresosGerente.porcentajePorBonoMensualPagadoEnSemana,
    porcentajePorCobranzaPagadoEnSemana: weeklyClose.egresosGerente.porcentajePorCobranzaPagadoEnSemana,
    totalEgresosAgente: weeklyClose.egresosAgente.totalEgresosAgente,
    uidVerificacionAgente,
    uidVerificacionGerente
  }
}