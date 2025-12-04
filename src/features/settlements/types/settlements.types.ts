export interface Liquidacion {
  cargo: number // si
  cliente: string // si 
  cobrado: number // si
  descuentoDinero: number // si
  descuentoPorcentaje: number // si
  entregado: number
  identificador: string // si
  liquidaCon: number // si
  montoTotal: number 
  prestamoId: string // si
  saldo: number // si
  semanasTranscurridas: number // si
  semEntrega: string // si
  quienPago?: string, // si
  recuperadoPor?: string, // si
}


export interface settlementDetails {
  prestamo_id: string;
  identificador: string;
  cliente: string;
  agencia: string;
  monto_otorgado: number;
  cargo: number;
  total_a_pagar: number;
  cobrado: number;
  plazo_semanas: number;
  tipo_cliente: string;
  tarifa: number;
  sem_entrega: number;
  anio_entrega: number;
  sem_actual: number;
  anio_actual: number;
  semanas_transcurridas: number;
  saldo_al_iniciar_semana: number;
  pago_realizado: number;
  pago_semanal: number;
  excedente: number;
  status_pago: string;
  saldo: number;
  descuento_porcentaje: number;
  descuento_dinero: number;
  liquida_con: number;
  estado_liquidacion: string;
}


export interface PayloadCreateSettlement {
  prestamo_id: string;
  recuperado_por: string;
  comentario: string;
}