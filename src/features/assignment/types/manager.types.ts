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