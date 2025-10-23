export interface ICashFlow {
  resumen: {
    ingresos: number
    egresos: number
    diferencia: number
  }

  primerosPagos: {
    tipo: IType
    total: number
    cantidad: number
  }

  ventas: {
    tipo: IType
    total: number
    cantidad: number
  }

  cobranzaAgenciasVacantes: {
    totalIngresos: number
  }

  asignaciones: {
    agentes: {
      subtotalIngresos: number
      ingresos: IAgentIncome[]
    }
    administracion: {
      subtotalIngresos: number
      subtotalEgresos: number
      ingresos: IIncome[]
      egresos: IExpense[]
    }

    seguridad: {
      subtotalIngresos: number
      subtotalEgresos: number
      ingresos: IIncome[]
      egresos: IExpense[]
    }

    operaciones: {
      subtotalIngresos: number
      subtotalEgresos: number
      ingresos: IIncome[]
      egresos: IExpense[]
    }
  }

  gastosSemanales: {
    subtotal: number
    gastos: IWeeklyExpense[]
  }

  otros: {
    subtotalIngresos: number
    subtotalEgresos: number
    ingresos: IOther[]
    egresos: IOther[]
  }
}

type IType = 'ingresos' | 'egresos'

interface IIncome {
  fecha: string
  recibidoDe: string
  monto: number
}

interface IExpense {
  fecha: string
  asignadoA: string
  monto: number
}

interface IAgentIncome {
  agencia: string
  agente: string
  monto: number
  cantidad: number
}

interface IWeeklyExpense {
  fecha: string
  tipo: 'CASETAS' | 'GASOLINA' | 'MANTENIMIENTO' | 'OTROS'
  concepto: string
  monto: number
}

interface IOther {
  fecha: string
  descripcion: string
  monto: number
}