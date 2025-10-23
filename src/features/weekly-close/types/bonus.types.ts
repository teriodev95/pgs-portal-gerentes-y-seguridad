interface SemanaDatos {
  agencia: string;
  gerencia: string;
  anio: number;
  semana: number;
  mes: string;
  diaRegistro: string;
  fecha: string;
  inicioSemana: string;
  finSemana: string;
  debito: number;
  ventas: number;
  cobranzaPura: number;
  primerosPagosCount: number;
  primerosPagos: number;
  montoExcedente: number;
  baseBono: number;
  liquidaciones: number;
  descuentoPorLiquidacion: number;
  numClientesLiquidacion: number;
  ventasNuevasCount: number;
  montoVentasNuevas: number;
  totalClientes: number;
  noPagos: number;
  pagosReducidos: number;
  clientesPagoCompleto: number;
  cobranzaTotal: number;
  rendimientoSemanal: number;
}

interface ResumenMensual {
  promedioClientes: number;
  promedioNoPagos: number;
  promedioPagosReducidos: number;
  totalDebitoMes: number;
  totalVentasMes: number;
  totalCobranzaPuraMes: number;
  totalCobranzaTotalMes: number;
  totalBaseBono: number;
  totalNumVentas: number;
  totalMontoExcedente: number;
  totalLiquidaciones: number;
  rendimientoPromedioMes: number;
  ultimaSemana: number;
}

export interface IBonusSummary {
  porcentajeBono: number;
  montoBono: number;
  nivel: string;
  criterio: string;
  cumpleCriterio: boolean;
}

interface DatosAgencia {
  agencia: string;
  gerencia: string;
  anio: number;
  mes: string;
  semanas: SemanaDatos[];
  resumen: ResumenMensual;
  bono: IBonusSummary;
}

export interface IBonusDetails {
  data: DatosAgencia;
  success: boolean;
}