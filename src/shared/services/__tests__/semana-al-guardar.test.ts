import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { MSG_SEMANA_NO_DISPONIBLE } from '../semana-validacion'

// Las dos pruebas de la HU sin esperar al martes:
// 1. "semana simulada": el store se quedó en una semana vieja; el guardado debe usar la de FAX.
// 2. "FAX caído": /calendario/actual falla; no se guarda nada y se avisa al gerente.

const SEMANA_FAX = { semana: 45, anio: 2026, desde: '2026-11-04', hasta: '2026-11-10' }
const SEMANA_VIEJA = { week: 44, year: 2026 }

let faxCaido = false
let llamadas: { metodo: string; args: unknown[] }[] = []
let errores: string[] = []

// Respuesta que sirve a cualquier lectura: arreglo (para .filter) con los campos que leen los composables.
const respuestaVacia = () => ({
  data: Object.assign([], { cobranza: [], result: 'sin tabulación', identificadorCredito: 'ID-PRUEBA' })
})

// Servicio falso: registra cada llamada y responde vacío.
const servicioFalso = () =>
  new Proxy({}, {
    get: (_, metodo: string) => async (...args: unknown[]) => {
      llamadas.push({ metodo, args })
      return respuestaVacia()
    }
  })

// Store de feature falso: cualquier método es un no-op.
const storeFalso = () => new Proxy({}, { get: () => () => {} })

const $store = {
  currentDate: { ...SEMANA_VIEJA },
  agencySelected: 'AGDC101',
  gerenciaSelected: 'GERDC100',
  isUserManager: true,
  user: { nombre: 'Prueba', usuarioId: 1 },
  cobranzas: [] as unknown[]
}

mock.module('@/shared/services/modules', () => ({
  commonService: {
    getCurrentDate: async () => {
      if (faxCaido) throw new Error('Network Error')
      return { data: SEMANA_FAX }
    },
    getCobranza: async () => respuestaVacia()
  }
}))
mock.module('@/shared/stores', () => ({ useStore: () => $store }))
mock.module('@/shared/composables/useNotification', () => ({
  useNotification: () => ({
    showError: (m: string) => errores.push(m),
    showWarning: () => {},
    showSuccess: () => {},
    showInfo: () => {}
  })
}))
mock.module('@/shared/composables/useGeolocation', () => ({
  default: () => ({ userLocation: { value: null }, hasPermission: { value: true } })
}))
mock.module('@/shared/utils', () => ({ getFullTimestamp: () => '2026-11-06 10:00:00' }))
mock.module('@/features/loan/services/loan.service', () => ({ loanAndPaymentService: servicioFalso() }))
mock.module('@/features/sale/services/sale.service', () => ({ salesService: servicioFalso() }))
mock.module('@/features/sale/stores', () => ({ useSaleStore: storeFalso }))
mock.module('@/features/expense/services/expense.service', () => ({ weeklyExpenseService: servicioFalso() }))
mock.module('@/features/expense/stores', () => ({ useExpenseStore: storeFalso }))
mock.module('@/features/incident/services/incident.service', () => ({ incidentService: servicioFalso() }))
mock.module('@/features/incident/stores', () => ({ useIncidentStore: storeFalso }))
mock.module('@/features/tabulator/services/tabulator.service', () => ({ tabulationService: servicioFalso() }))

// processPayment usa window.crypto.randomUUID()
;(globalThis as { window?: unknown }).window ??= globalThis

const { usePaymentManagement } = await import('@/features/loan/composables/usePaymentManagement')
const { useSaleData } = await import('@/features/sale/composables/useSaleData')
const { useExpenseData } = await import('@/features/expense/composables/useExpenseData')
const { useIncidentData } = await import('@/features/incident/composables/useIncidentData')
const { useMoneyTabulation } = await import('@/features/tabulator/composables/useMoneyTabulation')

const creado = (metodo: string) =>
  llamadas.filter(l => l.metodo === metodo).map(l => l.args[0] as { semana: number; anio: number })

// Cada flujo: cómo guardar y qué método de servicio crea el registro.
const flujos: { nombre: string; crear: string; guardar: () => Promise<unknown> }[] = [
  {
    nombre: 'pago',
    crear: 'createPayment',
    guardar: () => {
      const p = usePaymentManagement()
      p.selectPaymentForProcessing({ prestamoId: 1, nombre: 'Cliente Prueba', tarifa: 100 } as never)
      return p.processPayment(100, 'CLIENTE' as never, 'AGENTE' as never)
    }
  },
  {
    nombre: 'venta',
    crear: 'createSale',
    guardar: () =>
      useSaleData().saveSale({
        fecha: '2026-11-06', agencia: 'AGDC101', nombreCliente: 'Cliente Prueba', generadaPor: 'AGENTE',
        tipo: 'NUEVO', nivel: 'NOBEL', plazo: 15, monto: 1000, primerPago: 100
      } as never)
  },
  {
    nombre: 'gasto',
    crear: 'createExpense',
    guardar: () => useExpenseData().saveExpense({ monto: 100, tipoGasto: 'OTROS' } as never)
  },
  {
    nombre: 'incidencia',
    crear: 'createIncident',
    guardar: () => useIncidentData().saveIncident({ categoria: 'X', tipo: 'Y', monto: 10 } as never)
  },
  {
    nombre: 'tabulación',
    crear: 'createMoneyTabulation',
    guardar: () => useMoneyTabulation().saveTabulationData({ cantidad1Peso: 1 } as never, false)
  }
]

beforeEach(() => {
  faxCaido = false
  llamadas = []
  errores = []
  $store.currentDate = { ...SEMANA_VIEJA }
})

for (const f of flujos) {
  describe(`${f.nombre}: semana al guardar`, () => {
    it('semana simulada: con el store en S44, se guarda en la semana de FAX (S45)', async () => {
      await f.guardar()
      expect(creado(f.crear)).toEqual([expect.objectContaining({ semana: 45, anio: 2026 })])
      expect(errores).toEqual([])
    })

    it('FAX caído: no se guarda nada y se avisa al gerente', async () => {
      faxCaido = true
      await f.guardar().catch(() => {})
      expect(creado(f.crear)).toEqual([])
      expect(errores).toContain(MSG_SEMANA_NO_DISPONIBLE)
    })
  })
}

it('tabulación: la carga también usa la semana de FAX, no la del store', async () => {
  await useMoneyTabulation().fetchTabulationData()
  const carga = llamadas.find(l => l.metodo === 'getMoneyTabulation')?.args[0] as { week: number; year: number }
  expect(carga).toEqual(expect.objectContaining({ week: 45, year: 2026 }))
})
