export interface ILoanPayments {
  prestamoId: string;
  pagos: IPayment[];
}

export interface IPayment {
  pagoId: string;
  anio: number;
  semana: number;
  fechaPago: string;
  abreCon: number;
  monto: number;
  cierraCon: number;
  tarifa: number;
  cierraConCalculado: number;
  validacion: string;
  tipo: string;
  agente: string;
  creadoDesde: string;
  comentario: string;
  lat?: number;
  lng?: number;
}