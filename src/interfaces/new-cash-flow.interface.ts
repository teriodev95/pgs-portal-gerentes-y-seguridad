// Interfaz para detalles de transacciones (usada en varios lugares)
interface ITransactionDetail {
  concepto: string;
  monto: number;
  fecha: string;
  id: string;
}

// Interfaz para categorías de ingresos/egresos que contienen detalles
interface ITransactionCategory {
  total: number;
  detalles: ITransactionDetail[];
}

// Interfaz para ingresos
interface IIncome {
  total: number;
  asignaciones: ITransactionCategory;
  incidentes: ITransactionCategory;
  primerosPagos: ITransactionCategory;
}

// Interfaz para egresos
interface IExpense {
  total: number;
  asignaciones: ITransactionCategory;
  incidentes: ITransactionCategory;
  gastos: ITransactionCategory;
  ventas: ITransactionCategory;
}

// Interfaz principal para el flujo de caja
interface ICashFlow {
  gerencia_id: string;
  nombre_gerencia: string;
  semana: number;
  anio: number;
  ingresos: IIncome;
  egresos: IExpense;
  saldo: number;
}

export type { ICashFlow, IIncome, IExpense, ITransactionCategory, ITransactionDetail };