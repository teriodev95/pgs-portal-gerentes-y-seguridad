export interface PagoBono {
  aplicaPagoBono: boolean;
  bonos: number;
  porcentajeBonoMensual: number;
  nivelBono: string;
  criterioBono: string;
  cumpleCriterioBono: boolean;
  mesBono: string | null;
  baseBonoMensual: number;
  rendimientoPromedioMes: number;
  promedioClientesMes: number;
  promedioNoPagosMes: number;
  promedioPagosReducidosMes: number;
  totalCobranzaPuraMes: number;
  totalCobranzaTotalMes: number;
  totalVentasMes: number;
  ultimaSemanaDelMes: number;
}

export interface Referencia {
  pinAgente: number;
  agencia: string;
  gerencia: string;
  agente: string;
  fechaIngreso: string; // ISO date "YYYY-MM-DD"
  mesesTrabajados: number;
  statusAgencia: string;
  anio: number;
  semana: number;
  mes: string;
  inicioSemana: string; // ISO date "YYYY-MM-DD"
  finSemana: string;    // ISO date "YYYY-MM-DD"
  agenciaCerrada: number;
}

export interface DashboardAgencia {
  clientes: number;
  clientesCobrados: number;
  noPagos: number;
  pagosReducidos: number;
  clientesLiquidados: number;
  cobranzaPura: number;
  excedente: number;
  liquidaciones: number;
  multas: number;
  cobranzaTotal: number;
  totalDescuento: number;
  debitoGeneral: number;
  debitoNoImpacta: number;
  debitoAplicable: number;
  totalPagado: number;
  rendimiento: number;
  rendimientoGeneral: number;
  debitoMiercoles: number;
  debitoJueves: number;
  debitoViernes: number;
  debitoFaltante: number;
  ventas: number;
  numeroVentas: number;
  numeroAsignaciones: number;
  asignaciones: number;
  efectivoEnCampo: number;
}

export interface Comisiones {
  clientesPagoCompleto: number;
  recuperacionAlJueves: number;
  cobranzaPura: number;
  excedente: number;
  primerosPagos: number;
  numeroVentas: number;
  nivelComision: string;
  numeroNivelComision: number;
  porcentajeComisionCobranza: number;
  baseComision: number;
  pagoComisionCobranza: number;
  pagoComisionVentas: number;
  pagoBono: PagoBono;
  comisionSemanal: number;
  comisionTotal: number;
}

export interface Cierre {
  cierreExiste: boolean;
  cierreId: string | null;
  snapshotReglaComisionId: number;
  otrosIngresos: number;
  motivoOtrosIngresos: string | null;
  asignacionesPreviasEfectivo: number;
  otrosEgresos: number;
  motivoOtrosEgresos: string | null;
  efectivoEntregadoCierre: number;
  efectivoRestanteCierre: number;
  pagoComisionCobranza: number;
  pagoComisionVentas: number;
  bonos: number;
  uidVerificacionAgente: string | null;
  uidVerificacionGerente: string | null;
  observaciones: string | null;
  createdAt: string | null; // ISO datetime
  updatedAt: string | null; // ISO datetime
}

export interface AgenciaDashboard {
  referencia: Referencia;
  dashboardAgencia: DashboardAgencia;
  comisiones: Comisiones;
  cierre: Cierre;
}

export interface CreateNewWeeklyClose {
  agencia: string;
  semana: number;
  anio: number;
  snapshot_regla_comision_id: number;
  clientes: number;
  pagos_reducidos: number;
  no_pagos: number;
  clientes_liquidados: number;
  cobranza_pura: number;
  excedente: number;
  liquidaciones: number;
  multas: number;
  otros_ingresos: number;
  motivo_otros_ingresos: string;
  asignaciones_previas_efectivo: number;
  otros_egresos: number;
  motivo_otros_egresos: string;
  efectivo_entregado_cierre: number;
  pago_comision_cobranza: number;
  pago_comision_ventas: number;
  bonos: number;
  efectivo_restante_cierre: number;
  uid_verificacion_agente: string;
  uid_verificacion_gerente: string;
  observaciones: string;
}
