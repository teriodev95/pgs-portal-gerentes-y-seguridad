import type { PaymentSource, RecoverySource } from "@/features/loan/types"

export interface Liquidacion {
  cargo: number
  cliente: string 
  cobrado: number 
  descuentoDinero: number 
  descuentoPorcentaje: number 
  entregado: number
  identificador: string 
  liquidaCon: number 
  montoTotal: number 
  prestamoId: string 
  saldo: number 
  semanasTranscurridas: number 
  semEntrega: string 
  quienPago?: string
  recuperadoPor?: string
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

export interface IPaymentFormData {
  amount: number
  paymentSource: PaymentSource
  paymentRecovery: RecoverySource
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

export interface IPayloadSpecialSettlement {
  prestamo_id: string,
  descuento_dinero: number,
  descuento_porcentaje: number,
  liquida_con: number,
  sem_transcurridas: number,
  recuperado_por: string,
  status_recuperacion: string,
  comentario: string
}