interface ILog {
  [key: string]: any;
}

export interface ICreateAssignment {
  id: string;
  monto: number;             // amount
  agencia?: string;           // agency
  esAgenciaVacante?: boolean; // isAgencyVacant
  gerenciaEntrega: string;   // deliveryManagement
  gerenciaRecibe: string;    // receivingManagement
  semana: number;            // week
  anio: number;              // year
  tipo?: string;              // type
  quienEntrego: number;      // whoDelivered
  quienRecibio: number;      // whoReceived
  impactaDetalleCierre?: boolean; // impactsClosingDetail
  log?: ILog;
}

interface IManagement {
  gerenciaid: string;
  deprecatedName: string;
  status: string;
  sucursalid: string;
  sucursal: string;
}

export interface IUserVerificationPin {
  usuarioid: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipo: string;
  pin: number;
  usuario: string;
  puedeVerificarAsignaciones: boolean;
  puedeCobrar: boolean;
  status: boolean;
  gerencia: string | null;
  agencia: string | null;
  fechaIngreso: string;
  telegramId: string | null;
  numeroCelular: string;
  createdAt: string;
  updatedAt: string;
  gerenciasACargo: IManagement[];
  fechaIngresoFormatted: string;
  createdAtFormatted: string;
  updatedAtFormatted: string;
}

export interface IAssignmentParticipant {
  usuarioId: number;
  usuario: string;
  nombre: string;
  tipo: string;
  gerencia: string | null;
  agencia: string | null;
}

export interface ICustodyAssignment {
  originAssignmentId: string;
  /** saldo que sigue en custodia (monto original menos retornos parciales) */
  amount: number;
  /** monto de la asignación de origen */
  originalAmount: number;
  /** null cuando la custodia es a nivel gerencia (Gerente -> Seguridad/Regional) */
  agency: string | null;
  derivedManagement: string;
  /** agente: nació en un agente; gerencia: nació en el gerente */
  level: 'agente' | 'gerencia';
  week: number;
  year: number;
  status: 'pendiente' | 'retornado';
  createdAt: string;
  agent: IAssignmentParticipant | null;
  custodian: IAssignmentParticipant | null;
}

export interface ICustodyAssignmentsResponse {
  week: number;
  year: number;
  total: number;
  assignments: ICustodyAssignment[];
}

export interface IReturnCustodyPayload {
  /** custodio = relevo a otro Seguridad/Regional; la custodia sigue abierta en él */
  destino: 'gerente' | 'admin' | 'custodio';
  quien_recibio: number;
  /** string = saldo completo; { id, monto } = retorno parcial (0 < monto <= saldo) */
  origen_asignacion_ids: Array<string | { id: string; monto?: number }>;
}
