export const LOAN_FIELD_LABELS = {
  // Summary fields
  COLLECTED: 'Cobrado',
  BALANCE: 'Saldo',
  CLIENT: 'Cliente',
  STATUS: 'Estado',

  // General data section
  AGENT: 'Agente',
  CLIENT_ID: 'Cliente',
  MANAGER: 'Gerente',
  DELIVERY: 'Entrega',

  // Client data section
  NAME: 'Nombre',
  NEIGHBORHOOD: 'Colonia',
  STREET: 'Calle',
  HOUSE_NUMBERS: 'Números de la casa',
  PHONE: 'Teléfono',
  LEVEL: 'Nivel',
  GRANTED: 'Otorgado',

  // Guarantor data section
  GUARANTOR_NAME: 'Nombre',
  GUARANTOR_NEIGHBORHOOD: 'Colonia',
  GUARANTOR_STREET: 'Calle',
  GUARANTOR_HOUSE_NUMBERS: 'Números de la casa',
  GUARANTOR_PHONE: 'Teléfono',

  // Loan data section
  DELIVERY_DATE: 'Fecha Entrega',
  LOAN_ID: 'Préstamo Id',
  WEEK: 'Semana',
  PAYMENT_DAY: 'Día de Pago',
  TERM: 'Plazo',
  CHARGES: 'Cargos',
  TOTAL_TO_PAY: 'Total a Pagar',
  FIRST_PAYMENT: 'Primer Pago',
  WEEKLY_PAYMENT: 'Pago Semanal',
  BALANCE_LOAN: 'Saldo',
  COLLECTED_LOAN: 'Cobrado'
} as const

export const LOAN_SECTION_TITLES = {
  GENERAL_DATA: 'Datos Generales',
  CLIENT_DATA: 'Datos del Cliente',
  GUARANTOR_DATA: 'Datos del Aval',
  LOAN_DATA: 'Datos del Crédito'
} as const

export const LOAN_HOUSE_NUMBER_FORMAT = {
  EXTERIOR: '#Exterior:',
  INTERIOR: '#Interior:'
} as const

export type LoanFieldLabelType = keyof typeof LOAN_FIELD_LABELS
export type LoanSectionTitleType = keyof typeof LOAN_SECTION_TITLES