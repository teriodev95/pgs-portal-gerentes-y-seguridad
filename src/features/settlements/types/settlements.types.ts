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

export interface ISpecialSettlement {
  prestamo_id: string;
  cliente: string;
  gerencia: string;
  agente: string;
  semana_inicio: number;
  anio_inicio: number;
  plazo_semanas: number;
  semanas_transcurridas: number;
  monto_otorgado: number;
  total_a_pagar: number;
  tarifa: number;
  cobrado: number;
  saldo: number;
  ultima_semana_pago: number;
  ultimo_anio_pago: number;
  semanas_sin_pagar: number;
  numero_pagos: number;
  comision_cobranza: number;
  comision_venta: number;
  comision_total: number;
  por_recuperar: number;
  faltante: number;
  descuento_disponible: number;
  status_recuperacion: string;
  liquida_con_10_porciento: number;
  liquida_con_20_porciento: number;
  liquida_con_30_porciento: number;
  liquida_con_40_porciento: number;
  liquida_con_50_porciento: number;
}