interface IUser {
  usuarioid: number;
  nombre: string;
  apellidoPaterno: string;
  usuario: string;
  tipo: string;
  gerencia: string | null;
}

export interface INewAssignment {
  id: string;
  monto: number;
  agencia: string | null;
  esAgenciaVacante: boolean;
  gerenciaEntrega: string;
  gerenciaRecibe: string | null;
  semana: number;
  anio: number;
  tipo: string;
  quienEntrego: number;
  quienRecibio: number;
  impactaDetallesCierre: boolean;
  createdAt: string;
  updatedAt: string;
  usuarioEntrego: IUser;
  usuarioRecibio: IUser;
  createdAtFormatted: string;
  updatedAtFormatted: string;
}