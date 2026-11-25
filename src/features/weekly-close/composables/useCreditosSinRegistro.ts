import { computed, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { useNotification } from '@/shared/composables/useNotification'
import { getSemanaActual } from '@/shared/services/semana-actual'
import { usePaymentManagement } from '@/features/loan/composables/usePaymentManagement'
import { PaymentSource, RecoverySource } from '@/features/loan/types'
import type { ICobranza } from '@/interfaces'
import { weeklyClosingService } from '../services/weekly-close.service'
import type { CreditoSinRegistro } from '../types'

/**
 * Créditos vivos de la agencia sin pago ni no pago capturado en la semana del cierre.
 * Mientras haya alguno el cierre no se firma (Elysia también lo rechaza con 409).
 */
export const useCreditosSinRegistro = () => {
  const globalStore = useStore()
  const { showError, showSuccess } = useNotification()
  const { processPayment, selectPaymentForProcessing, loadPayments } = usePaymentManagement()

  const creditos = ref<CreditoSinRegistro[]>([])
  const registrados = ref(0)
  const isRegistrando = ref(false)
  const semana = computed(() => globalStore.currentDate.week)

  /** Consulta los faltantes y devuelve cuántos son; -1 si no se pudo consultar. */
  const cargar = async (): Promise<number> => {
    try {
      const { data } = await weeklyClosingService.getCreditosSinRegistro({
        agency: globalStore.agencySelected as string,
        year: globalStore.currentDate.year,
        week: globalStore.currentDate.week
      })
      creditos.value = data.data
      return creditos.value.length
    } catch {
      return -1 // el servicio ya avisó; sin respuesta no se da por bueno
    }
  }

  /** Registra a todos los faltantes como no pago de $0, igual que si el gerente los capturara uno a uno. */
  const registrarNoPagos = async () => {
    isRegistrando.value = true
    registrados.value = 0
    try {
      // processPayment guarda en la semana de hoy; si ya no es la del cierre, los $0 caerían en otra semana.
      const hoy = await getSemanaActual()
      if (hoy.semana !== globalStore.currentDate.week || hoy.anio !== globalStore.currentDate.year) {
        showError(`La semana ${semana.value} ya terminó. Actualiza la aplicación antes de continuar.`)
        return
      }

      for (const credito of creditos.value) {
        selectPaymentForProcessing({
          prestamoId: credito.prestamoId,
          nombre: credito.cliente,
          tarifa: credito.tarifa
        } as ICobranza)
        const guardado = await processPayment(0, PaymentSource.CLIENT, RecoverySource.AGENT, true)
        if (!guardado) break
        registrados.value++
      }

      if (registrados.value > 0) showSuccess(`${registrados.value} no pagos registrados en la semana ${semana.value}`)
      await Promise.all([cargar(), loadPayments()])
    } catch (error) {
      showError((error as Error).message)
    } finally {
      isRegistrando.value = false
    }
  }

  return { creditos, semana, registrados, isRegistrando, cargar, registrarNoPagos }
}
