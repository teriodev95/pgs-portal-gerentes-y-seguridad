import type { INewAssignment } from "@/features/assignment/types"

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
  asignaciones: INewAssignment[];
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

export interface IFastWeeklyClose {
  resumenSemanal: IResumenSemanal;
  egresosAgente: IEgresosAgente;
  egresosGerente: IEgresosGerente;
  rendimientoFun: IRendimientoFun;
  isSemanaBonos: IIsSemanaBonos;
  agenciaCerrada: boolean;
  pinAgente: number
  statusAgencia: 'ACTIVA' | 'VACANTE'
  id: number;
}

// Interfaz extendida para el store local que incluye ingresosAgente
export interface IWeeklyCloseWithIncome extends IFastWeeklyClose {
  ingresosAgente: IIngresosAgente;
}

export interface ICreateCierreSemana {
  semana: number
  anio: number
  agencia: string
  agente: string
  gerencia: string
  gerente: string
  clientes: number
  pagosReducidos: number
  noPagos: number
  clientesLiquidados: number
  liquidaciones: number
  multas: number
  otrosIngresos: number
  motivoOtrosIngresos: string
  asignaciones: number
  otrosEgresos: number
  motivoOtrosEgresos: string
  totalEgresosAgente: number
  comisionCobranzaPagadaEnSemana: number
  porcentajePorCobranzaPagadoEnSemana: number
  bonosPagadosEnSemana: number
  porcentajePorBonoMensualPagadoEnSemana: number
  comisionVentasPagadaEnSemana: number
  efectivoRestanteCierre: number
  efectivoEntregadoCierre: number
  uidVerificacionAgente: string
  uidVerificacionGerente: string
}

export interface IUploadVideoResponse { 
  videoUrl: string
  success: boolean
  error?: string
}

export interface IAgencyDashboard {
  gerencia: string;
  agencia: string;
  anio: number;
  semana: number;
  clientes: number;
  clientesCobrados: number;
  noPagos: number;
  numeroLiquidaciones: number;
  pagosReducidos: number;
  debitoMiercoles: number;
  debitoJueves: number;
  debitoViernes: number;
  debitoTotal: number;
  rendimientoGeneral: number;
  totalDescuento: number;
  totalCobranzaPura: number;
  montoExcedente: number;
  multas: number;
  liquidaciones: number;
  cobranzaTotal: number;
  debitoFaltante: number;
  efectivoEnCampo: number;
  statusAgencia: string;
  numeroVentas: number;
  ventas: number;
  numeroAsignaciones: number;
  asignaciones: number;
  agenciaCerrada: number; // 0 o 1 (booleano como número)
  debitoGeneral: number;
  debitoNoImpacta: number;
  debitoAplicable: number;
  totalPagado: number;
  rendimiento: number;
}