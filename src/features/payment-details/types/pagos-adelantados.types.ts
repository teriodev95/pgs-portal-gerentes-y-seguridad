export interface IDetalleSemanaAdelantado {
  semana: number
  anio: number
  fecha: string
  cobertura: 'COMPLETA' | 'PARCIAL'
  cubierto: number
  a_cobrar: number
}

export interface IResumenAdelantado {
  prestamo: string
  cliente: string
  agencia: string
  montoPagadoSemana: number
  tarifa: number
  excedente: number
  semanasMarcadas: number
  semanas: string
  remanente: number
  saldoRestante: number
  detalleSemanas: IDetalleSemanaAdelantado[]
  ejecutado: 0 | 1
  usuario: string
}

export interface IAdelantadoApiResponse {
  success: boolean
  data?: IResumenAdelantado
  error?: string
}
