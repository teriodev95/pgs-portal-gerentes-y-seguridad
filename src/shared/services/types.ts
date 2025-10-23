export interface ServerTime {
  Fecha: string
  Hora: string
}

export interface GetBaseProps {
  agency: string
  year: number
  week: number
}

export interface GetCobranzaProps extends GetBaseProps {}
export type TypeStatus = 'Creada' | 'Aprobada' | 'Desembolsada' | 'Rechazada'

export interface LoanApplication {
  
}