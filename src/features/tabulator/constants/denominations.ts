import type { TabulationFormData } from '../types'

export interface Denomination {
  value: number
  quantity: number
  type: 'bill' | 'coin'
  formKey: keyof TabulationFormData
}

export const DEFAULT_DENOMINATIONS: Denomination[] = [
  // Billetes
  { value: 1000, quantity: 0, type: 'bill', formKey: 'cantidad1000Billetes' },
  { value: 500, quantity: 0, type: 'bill', formKey: 'cantidad500Billetes' },
  { value: 200, quantity: 0, type: 'bill', formKey: 'cantidad200Billetes' },
  { value: 100, quantity: 0, type: 'bill', formKey: 'cantidad100Billetes' },
  { value: 50, quantity: 0, type: 'bill', formKey: 'cantidad50Billetes' },
  { value: 20, quantity: 0, type: 'bill', formKey: 'cantidad20Billetes' },
  // Monedas
  { value: 20, quantity: 0, type: 'coin', formKey: 'cantidad20Pesos' },
  { value: 10, quantity: 0, type: 'coin', formKey: 'cantidad10Pesos' },
  { value: 5, quantity: 0, type: 'coin', formKey: 'cantidad5Pesos' },
  { value: 2, quantity: 0, type: 'coin', formKey: 'cantidad2Pesos' },
  { value: 1, quantity: 0, type: 'coin', formKey: 'cantidad1Peso' },
  { value: 0.5, quantity: 0, type: 'coin', formKey: 'cantidad50Centavos' },
]