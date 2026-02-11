export interface IIncidentFormData {
  categoria: 'incidente' | 'reposicion' | 'nomina'
  comentario: string
  monto: number
  tipo: 'ingreso' | 'egreso'
}

export interface IUser {
  usuarioid: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  usuario: string;
  tipo: string;
  gerencia: string;
  agencia: string | null;
}

export interface IIncident extends IIncidentFormData {
  anio: number;
  fecha: string;
  gerencia: string;
  semana: number;
  createdAt?: string;
  createdAtFormatted?: string;
  id?: number;
  updatedAt?: string;
  updatedAtFormatted?: string;
  usuario?: IUser;
  usuarioId?: number;
}