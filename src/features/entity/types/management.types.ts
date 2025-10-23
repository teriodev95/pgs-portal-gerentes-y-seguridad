export interface IManagementDashboardData {
  gerencia: string
  anio: number
  semana: number
  clientes: number
  clientesCobrados: number
  noPagos: number
  numeroLiquidaciones: number
  pagosReducidos: number
  debitoMiercoles: number
  debitoJueves: number
  debitoViernes: number
  debitoTotal: number
  rendimiento: number
  totalDeDescuento: number
  totalCobranzaPura: number
  montoExcedente: number
  multas: number
  liquidaciones: number
  cobranzaTotal: number
  montoDeDebitoFaltante: number
}

export interface IManagementDashboard {
  gerencia: string;
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
  rendimiento: number;
  totalDescuento: number;
  totalCobranzaPura: number;
  montoExcedente: number;
  multas: number;
  liquidaciones: number;
  debitoFaltante: number;
  numeroVentas: number;
  ventas: number;
  cobranzaTotal: number;
  sumaAsignaciones: number;
  efectivoEnCampo: number;
}