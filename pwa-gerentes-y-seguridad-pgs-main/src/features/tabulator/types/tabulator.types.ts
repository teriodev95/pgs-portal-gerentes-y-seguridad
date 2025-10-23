export interface TabulationFormData {
  cantidad50Centavos: number
  cantidad1Peso: number
  cantidad2Pesos: number
  cantidad5Pesos: number
  cantidad10Pesos: number
  cantidad20Pesos: number

  cantidad20Billetes: number
  cantidad50Billetes: number
  cantidad100Billetes: number
  cantidad200Billetes: number
  cantidad500Billetes: number
  cantidad1000Billetes: number
}

export interface MoneyTabulation extends TabulationFormData {
  anio: number
  semana: number
  gerencia: string
}