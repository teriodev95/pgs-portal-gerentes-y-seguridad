import type { IWeeklyCloseWithIncome } from '../types'
import type { CreateNewWeeklyClose } from '../types/new-weekly.types'

/**
 * Transforma IWeeklyCloseWithIncome a CreateNewWeeklyClose para la nueva API de Elysia
 */
export const transformToNewCreateCierre = (
  weeklyClose: IWeeklyCloseWithIncome,
  uidVerificacionAgente: string,
  uidVerificacionGerente: string,
  observaciones: string = ''
): CreateNewWeeklyClose => {
  return {
    agencia: weeklyClose.resumenSemanal.agencia,
    semana: weeklyClose.resumenSemanal.semana,
    anio: weeklyClose.resumenSemanal.anio,
    snapshot_regla_comision_id: weeklyClose.snapshot_regla_comision_id,
    clientes: weeklyClose.resumenSemanal.clientes,
    pagos_reducidos: weeklyClose.resumenSemanal.pagosReducidos,
    no_pagos: weeklyClose.resumenSemanal.noPagos,
    clientes_liquidados: weeklyClose.resumenSemanal.clientesLiquidados,
    cobranza_pura: weeklyClose.ingresosAgente.cobranzaPura,
    excedente: weeklyClose.ingresosAgente.montoExcedente,
    liquidaciones: weeklyClose.ingresosAgente.liquidaciones,
    multas: weeklyClose.ingresosAgente.multas,
    otros_ingresos: weeklyClose.ingresosAgente.otrosIngresos,
    motivo_otros_ingresos: weeklyClose.ingresosAgente.motivoOtrosIngresos,
    asignaciones_previas_efectivo: typeof weeklyClose.egresosAgente.asignaciones === 'number'
      ? weeklyClose.egresosAgente.asignaciones
      : 0,
    otros_egresos: weeklyClose.egresosAgente.otrosEgresos,
    motivo_otros_egresos: weeklyClose.egresosAgente.motivoOtrosEgresos,
    efectivo_entregado_cierre: weeklyClose.egresosAgente.efectivoEntregadoCierre,
    pago_comision_cobranza: weeklyClose.egresosGerente.comisionCobranzaPagadaEnSemana,
    pago_comision_ventas: weeklyClose.egresosGerente.comisionVentasPagadaEnSemana,
    bonos: weeklyClose.egresosGerente.bonosPagadosEnSemana,
    efectivo_restante_cierre: weeklyClose.egresosGerente.efectivoRestanteCierre,
    uid_verificacion_agente: uidVerificacionAgente,
    uid_verificacion_gerente: uidVerificacionGerente,
    observaciones
  }
}