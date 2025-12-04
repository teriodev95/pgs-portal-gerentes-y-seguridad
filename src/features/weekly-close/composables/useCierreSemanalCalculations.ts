// composables/useCierreSemanalCalculations.ts
import { computed, watch } from 'vue'
import { useCierreSemanalStore } from '@/features/weekly-close/stores'

/**
 * Composable para manejar todos los cálculos relacionados con el cierre semanal
 * Separa la lógica de cálculos del store y componentes
 */
export const useCierreSemanalCalculations = () => {
  const store = useCierreSemanalStore()

  /**
   * Calcula el total de montos de asignaciones
   */
  const totalAssignmentsAmount = computed(() => {
    return store.weeklyClose?.egresosAgente.asignaciones?.reduce((sum, assignment) => 
      sum + (assignment.monto || 0), 0
    ) || 0
  })

  /**
   * Calcula el total de asignaciones de seguridad
   */
  const totalSecurityAmount = computed(() => {
    return store.weeklyClose?.egresosAgente.asignaciones?.filter(assignment => assignment.tipo === 'Seguridad')
      .reduce((sum, assignment) => sum + (assignment.monto || 0), 0) || 0
  })

  /**
   * Calcula el total de asignaciones de gerencia
   */
  const totalManagementAmount = computed(() => {
    return store.weeklyClose?.egresosAgente.asignaciones?.filter(assignment => assignment.tipo === 'Gerente')
      .reduce((sum, assignment) => sum + (assignment.monto || 0), 0) || 0
  })

  /**
   * Calcula el total de ingresos del agente
   */
  const totalAgentIncome = computed(() => {
    if (!store.weeklyClose) return 0
    
    const { ingresosAgente } = store.weeklyClose

    console.log('INGRESOS AGENTE PARA CÁLCULO', ingresosAgente)
    
    return (
      (ingresosAgente?.cobranzaPura || 0) +
      (ingresosAgente?.montoExcedente || 0) +
      (ingresosAgente?.liquidaciones || 0) +
      (ingresosAgente?.multas || 0) +
      (ingresosAgente?.otrosIngresos || 0)
    )
  })

  /**
   * Calcula el total de egresos del agente
   */
  const totalAgentExpenses = computed(() => {
    if (!store.weeklyClose) return 0
    
    return (
      totalAssignmentsAmount.value +
      (store.weeklyClose.egresosAgente.otrosEgresos || 0) +
      (store.weeklyClose.egresosAgente.efectivoEntregadoCierre || 0)
    )
  })

  /**
   * Calcula el efectivo restante después del cierre
   */
  const remainingCash = computed(() => {
    if (!store.weeklyClose) return 0
    
    const { egresosAgente, egresosGerente } = store.weeklyClose
    const totalCommissions =
      (egresosGerente.comisionCobranzaPagadaEnSemana || 0) +
      (egresosGerente.comisionVentasPagadaEnSemana || 0) +
      (egresosGerente.bonosPagadosEnSemana || 0)

    console.log('cobranza', egresosGerente.comisionCobranzaPagadaEnSemana)
    
    return (egresosAgente.efectivoEntregadoCierre || 0) - totalCommissions
  })

  /**
   * Calcula el efectivo entregado en el cierre
   */
  const cashDelivered = computed(() => {
    if (!store.weeklyClose) return 0
    
    return (
      totalAgentIncome.value -
      (store.weeklyClose.egresosAgente.otrosEgresos || 0) -
      totalAssignmentsAmount.value
    )
  })

  /**
   * Calcula el total de comisiones a pagar
   */
  const totalCommissionsToPay = computed(() => {
    if (!store.weeklyClose) return 0
    
    const { egresosGerente } = store.weeklyClose
    return (
      (egresosGerente.comisionCobranzaPagadaEnSemana || 0) +
      (egresosGerente.comisionVentasPagadaEnSemana || 0) +
      (egresosGerente.bonosPagadosEnSemana || 0)
    )
  })

  /**
   * Calcula el balance final (ingresos - egresos)
   */
  const finalBalance = computed(() => {
    return totalAgentIncome.value - totalAgentExpenses.value
  })


  /**
   * Obtiene un resumen de todos los cálculos
   */
  const calculationSummary = computed(() => ({
    totalAgentIncome: totalAgentIncome.value,
    totalAgentExpenses: totalAgentExpenses.value,
    totalAssignmentsAmount: totalAssignmentsAmount.value,
    totalSecurityAmount: totalSecurityAmount.value,
    totalManagementAmount: totalManagementAmount.value,
    remainingCash: remainingCash.value,
    cashDelivered: cashDelivered.value,
    totalCommissionsToPay: totalCommissionsToPay.value,
    finalBalance: finalBalance.value,
  }))

  /**
   * Recalcula todos los valores (útil para forzar actualización)
   */
  const recalculateAll = () => {
    // Los computed se actualizarán automáticamente
    // Esta función existe por si necesitamos lógica adicional
    console.log('Recalculando valores del cierre semanal...')
    return calculationSummary.value
  }

  // Watchers para sincronización automática con el store
  watch(
    totalAssignmentsAmount,
    (newValue) => {
      if (newValue && store.weeklyClose) {
        store.updateNestedField('egresosAgente', 'asignacionesNumero', newValue)
        console.log('Cierre semanal actualizado:', newValue)
      }
    },
    { immediate: true }
  )

  watch(
    totalAgentExpenses,
    (newValue) => {
      if (store.weeklyClose) {
        store.updateNestedField('egresosAgente', 'totalEgresosAgente', newValue)
      }
    },
    { immediate: true }
  )

  watch(
    remainingCash,
    (newValue) => {
      if (store.weeklyClose) {
        console.log('Actualizando efectivo restante cierre:', newValue)
        store.updateNestedField('egresosGerente', 'efectivoRestanteCierre', newValue)
      }
    },
    { immediate: true }
  )

  watch(
    cashDelivered,
    (newValue) => {
      if (store.weeklyClose) {
        store.updateNestedField('egresosAgente', 'efectivoEntregadoCierre', newValue)
      }
    },
    { immediate: true }
  )

  return {
    // Cálculos individuales
    totalAssignmentsAmount,
    totalAgentIncome,
    totalAgentExpenses,
    remainingCash,
    
    // Resumen y utilidades
    calculationSummary,
    recalculateAll
  }
}