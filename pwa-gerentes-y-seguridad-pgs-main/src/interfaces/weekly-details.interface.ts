interface IClientComparison {
  semanaAnterior: number;
  semanaActual: number;
}

export interface IAgencyClosureDetail {
  debito: number;
  cobranzaPura: number;
  faltante: number;
  eficiencia: number;
  ventas: number;
  agencia: string;
  agente: string;
  clientes: IClientComparison;
  noPagos: IClientComparison;
  pagosReducidos: IClientComparison;
  clientesLiquidados: IClientComparison;
}

export interface IGeneralBalance {
  semana: number;
  anio: number;
  tituloReporte: string;
  sucursal: string;
  gerente: string;
  zona: string;
  curdate: string;
  agencias: IAgencyClosureDetail[];
}

interface IComparison {
  semanaAnterior: number;
  semanaActual: number;
  diferencia: number;
}

interface IFinancialMetrics {
  debito: IComparison;
  cobranzaPura: IComparison;
  faltante: IComparison;
  eficiencia: IComparison;
}

interface IClientMetrics {
  descuentoPorLiquidacion: number;
  clientes: IComparison;
  noPagos: IComparison;
  pagosReducidos: IComparison;
  clientesLiquidados: IComparison;
}

interface ISalesObjectives {
  objetivo: number;
  porcentajeAlcanzado: number;
  ventasNuevas: number;
  renovaciones: number;
  totalVentas: number;
  cantidadVentasNuevas: number;
  cantidadRenovaciones: number;
  cantidadTotalVentas: number;
}

export interface IManagementNumbers {
  titulo: string;
  metricasFinancieras: IFinancialMetrics;
  metricasClientes: IClientMetrics;
  objetivosVentas: ISalesObjectives;
}

export type userPDF = 'admin' | 'managment'