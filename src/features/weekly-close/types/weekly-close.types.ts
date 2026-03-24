export interface IRendimientoFun {
  debitoAplicable: number
  debitoGeneral: number
  debitoNoImpacta: number
  rendimientoGeneral: number
  totalPagado: number
}

export interface IResumenSemanal {
  semana: number;
  anio: number;
  agencia: string;
  agente: string;
  gerencia: string;
  gerente: string;
  clientes: number;
  pagosReducidos: number;
  noPagos: number;
  clientesLiquidados: number;
  rendimiento: number;
}

export interface IIngresosAgente {
  cobranzaPura: number;
  montoExcedente: number;
  liquidaciones: number;
  multas: number;
  otrosIngresos: number;
  motivoOtrosIngresos: string;
}

export interface IEgresosAgente {
  asignaciones: number;
  asignacionesNumero: number;
  otrosEgresos: number;
  motivoOtrosEgresos: string;
  totalEgresosAgente: number;
  efectivoEntregadoCierre: number;
}

export interface IEgresosGerente {
  comisionCobranzaPagadaEnSemana: number;
  comisionVentasPagadaEnSemana: number;
  bonosPagadosEnSemana: number;
  efectivoRestanteCierre: number;
  porcentajePorCobranzaPagadoEnSemana: number;
  porcentajePorBonoMensualPagadoEnSemana: number;
}

interface IIsSemanaBonos {
  pagoBono: boolean,
  mesAnterior: string,
  anioAnterior: number,
  mesActual: string,
  anioActual: number
}

export interface IWeeklyCloseWithIncome {
  resumenSemanal: IResumenSemanal;
  egresosAgente: IEgresosAgente;
  egresosGerente: IEgresosGerente;
  rendimientoFun: IRendimientoFun;
  isSemanaBonos: IIsSemanaBonos;
  agenciaCerrada: boolean;
  pinAgente: number;
  comisiones: number;
  statusAgencia: 'ACTIVA' | 'VACANTE';
  id: number;
  ingresosAgente: IIngresosAgente;
  snapshot_regla_comision_id: number;
}

export interface IUploadVideoResponse {
  videoUrl: string
  success: boolean
  error?: string
}