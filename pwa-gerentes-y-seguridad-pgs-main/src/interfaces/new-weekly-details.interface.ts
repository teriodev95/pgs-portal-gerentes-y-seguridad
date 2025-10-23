/**
 * Main interface for weekly financial details
 */
export interface IWeeklyDetails {
  efectivoAEntregar: number;
  ingresos: IIngresos;
  egresos: IEgresos;
  gerencia: string;
  gerencia_nombre: string;
  anio: number;
  semana: number;
}

/**
 * Interface for income details
 */
interface IIngresos {
  total: number;
  asignaciones: IAsignaciones;
  cobranza: ICobranza;
  incidentes: IIncidentes;
}

/**
 * Interface for expense details
 */
interface IEgresos {
  total: number;
  asignaciones: IAsignaciones;
  bonosYComisiones: IBonosYComisiones;
  ventas: IVentas;
  gastos: IGastos;
  incidentes: IIncidentes;
}

/**
 * Interface for allocations (used in both income and expenses)
 */
interface IAsignaciones {
  total: number;
  subTotal?: number;
  asignacionesList: IAsignacion[];
}

/**
 * Interface for a single allocation
 */
export interface IAsignacion {
  id: string;
  monto: number;
  agencia: string;
  esAgenciaVacante: boolean;
  gerenciaEntrega: string;
  gerenciaRecibe: string;
  semana: number;
  anio: number;
  tipo: string;
  quienEntrego: number;
  quienRecibio: number;
  impactaDetallesCierre: boolean;
  createdAt: string;
  updatedAt: string;
  createdAtFormatted: string;
  updatedAtFormatted: string;
}

/**
 * Interface for collection details
 */
interface ICobranza {
  total: number;
  cobranzaPura: number;
  montoExcedente: number;
  liquidaciones: number;
  primerosPagos: number;
  multas: number;
}

/**
 * Interface for incidents
 */
interface IIncidentes {
  total: number;
  incidentesList: IIncidente[];
}

/**
 * Interface for a single incident
 */
interface IIncidente {
  id: number;
  categoria: string;
  tipo: string;
  fecha: string;
  comentario: string;
  monto: string;
  usuarioId: number;
  usuario: IUsuario;
  gerencia: string;
  semana: number;
  anio: number;
  createdAt: string;
  updatedAt: string;
  createdAtFormatted: string;
  updatedAtFormatted: string;
}

/**
 * Interface for user details
 */
interface IUsuario {
  usuarioid: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  usuario: string;
  tipo: string;
  gerencia: string;
  agencia: string | null;
}

/**
 * Interface for bonuses and commissions
 */
interface IBonosYComisiones {
  total: number;
  comisionesCobranza: number;
  comisionesVentas: number;
  bonosAgentes: number;
  bonoYComisionesList: IBonoYComision[];
}

/**
 * Interface for a single bonus or commission
 */
interface IBonoYComision {
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
  liquidaciones: string;
  multas: string;
  otrosIngresos: string;
  motivoOtrosIngresos: string;
  asignaciones: string;
  otrosEgresos: string;
  motivoOtrosEgresos: string;
  totalEgresosAgente: string | null;
  comisionCobranzaPagadaEnSemana: string;
  porcentajePorCobranzaPagadoEnSemana: string;
  bonosPagadosEnSemana: string;
  porcentajePorBonoMensualPagadoEnSemana: string;
  comisionVentasPagadaEnSemana: string;
  efectivoRestanteCierre: string | null;
  efectivoEntregadoCierre: string;
  uidVerificacionAgente: string;
  uidVerificacionGerente: string;
  id: number;
  createdAt: string;
  updatedAt: string | null;
  idCompuesto: string;
}

/**
 * Interface for sales details
 */
interface IVentas {
  total: number;
  nuevas: INuevasVentas;
  renovaciones: IRenovacionesVentas;
}

/**
 * Interface for new sales
 */
interface INuevasVentas {
  total: number;
  ventasList: IVenta[];
}

/**
 * Interface for renewal sales
 */
interface IRenovacionesVentas {
  total: number;
  ventasList: IVenta[];
}

/**
 * Interface for a single sale
 */
interface IVenta {
  fecha: string;
  semana: number;
  anio: number;
  agencia: string;
  gerencia: string;
  nombre_cliente: string;
  tipo: string;
  nivel: string;
  plazo: number;
  monto: string;
  primer_pago: string;
  id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for expenses
 */
interface IGastos {
  total: number;
  gastosList: IGasto[];
}

/**
 * Interface for a single expense
 */
interface IGasto {
  gasto_id: number;
  creado_por_id: number;
  gerencia: string;
  tipo_gasto: string;
  fecha: string;
  semana: number;
  anio: number;
  monto: string;
  litros: string;
  concepto: string;
  url_recibo: string;
  reembolsado: boolean;
  created_at: string;
  updated_at: string;
  created_at_formatted: string;
  updated_at_formatted: string;
}