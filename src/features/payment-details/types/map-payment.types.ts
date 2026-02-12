export interface AgenciaPagosHistorial {
  abreCon: number
  agente: string
  anio: number
  cierraCon: number
  cliente: string
  comentario: string
  creadoDesde: string
  createdAt: string
  datosMigracion: string
  esPrimerPago: boolean
  fechaPago: string
  identificador: string
  lat: number
  lng: number
  log?: string
  monto: number
  pagoId: string
  prestamo: string
  prestamoId: string
  quienPago?: string
  semana: number
  tarifa: number
  tipo: string
  updatedAt: string
}

export interface IFullPayment {
  abreCon: string;
  agente: string;
  anio: number;
  cierraCon: string;
  cliente: string;
  comentario: string;
  creadoDesde: string;
  createdAt: string;
  datosMigracion: string | null;
  esPrimerPago: boolean;
  fechaPago: string;
  identificador: string;
  lat: number;
  lng: number;
  log: string;
  monto: string;
  pagoId: string;
  prestamo: string;
  prestamoId: string;
  quienPago: string;
  recuperadoPor: string;
  semana: number;
  tarifa: string;
  tipo: string;
  updatedAt: string | null;
}

export interface IMapPayment {
  prestamoId: string,
  prestamo: string,
  monto: number,
  tarifa: number,
  fechaPago: string,
  lat: number,
  lng: number,
}