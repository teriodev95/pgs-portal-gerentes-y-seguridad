import { computed, type Ref } from 'vue'
import type { Solicitud, Checks } from '../types'

export function useLoanRequestDetails(selectedLoanRequest: Ref<Solicitud | null>) {
  
  // Client information computed
  const clientInfo = computed(() => {
    if (!selectedLoanRequest.value) return []
    const cliente = selectedLoanRequest.value.informacionCliente
    return [
      { label: 'Nombre Completo', value: cliente.nombreCompleto },
      { label: 'CURP', value: cliente.curp },
      { label: 'RFC', value: cliente.rfc },
      { label: 'Estado Civil', value: cliente.estadoCivil },
      { label: 'Nacionalidad', value: cliente.nacionalidad || '' },
      { label: 'Fecha de Nacimiento', value: cliente.fechaNacimiento || '' },
      { label: 'Teléfono', value: cliente.telefono },
      { label: 'Email', value: cliente.email }
    ]
  })

  // Client documents computed
  const clientDocuments = computed(() => {
    if (!selectedLoanRequest.value) return []
    const documentos = selectedLoanRequest.value.informacionCliente.documentos
    return [
      { label: 'Comprobante', value: documentos.comprobante, type: 'image' as const },
      { label: 'INE Frontal', value: documentos.ineFrontal, type: 'image' as const },
      { label: 'INE Trasera', value: documentos.ineTrasera, type: 'image' as const },
      { label: 'No. Servicio', value: documentos.no_servicio, type: 'text' as const }
    ]
  })

  // Address information computed
  const addressInfo = computed(() => {
    if (!selectedLoanRequest.value) return []
    const domicilio = selectedLoanRequest.value.informacionCliente.domicilio
    return [
      { label: 'Dirección', value: domicilio.direccion },
      { label: 'Colonia', value: domicilio.colonia },
      { label: 'Municipio', value: domicilio.municipio },
      { label: 'Estado', value: domicilio.estado },
      { label: 'Código Postal', value: domicilio.codigoPostal },
      { label: 'Tipo de Propiedad', value: domicilio.tipoPropiedad }
    ]
  })

  // Guarantor information computed
  const guarantorInfo = computed(() => {
    if (!selectedLoanRequest.value) return []
    const aval = selectedLoanRequest.value.informacionAval
    return [
      { label: 'Nombre Completo', value: aval.nombreCompleto },
      { label: 'CURP', value: aval.curp },
      { label: 'RFC', value: aval.rfc },
      { label: 'Estado Civil', value: aval.estadoCivil },
      { label: 'Teléfono', value: aval.telefono },
      { label: 'Email', value: aval.email }
    ]
  })

  // Guarantor documents computed
  const guarantorDocuments = computed(() => {
    if (!selectedLoanRequest.value) return []
    const documentos = selectedLoanRequest.value.informacionAval.documentos
    return [
      { label: 'Comprobante', value: documentos.comprobante, type: 'image' as const },
      { label: 'INE Frontal', value: documentos.ineFrontal, type: 'image' as const },
      { label: 'INE Trasera', value: documentos.ineTrasera, type: 'image' as const },
      { label: 'No. Servicio', value: documentos.no_servicio, type: 'text' as const }
    ]
  })

  // Credit information computed
  const creditInfo = computed(() => {
    if (!selectedLoanRequest.value) return []
    const credito = selectedLoanRequest.value.detallesCredito
    return [
      { label: 'Monto Solicitado', value: `$${credito.montoSolicitado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` },
      { label: 'Total a Pagar', value: `$${credito.totalAPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` },
      { label: 'Plazo', value: credito.plazo },
      { label: 'Pago Semanal', value: `$${credito.primerPago.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` },
      { label: 'Cargo Total', value: `$${credito.cargo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` },
      { label: 'Nivel Cliente', value: credito.nivelCliente },
      { label: 'Tipo de Crédito', value: credito.tipoCredito }
    ]
  })

  // Schedule information computed
  const scheduleInfo = computed(() => {
    if (!selectedLoanRequest.value) return []
    const horarios = selectedLoanRequest.value.detallesCredito.horarios
    return [
      { label: 'Día de Entrega', value: `${horarios.diaEntrega} a las ${horarios.horaEntrega}` },
      { label: 'Día de Pago', value: `${horarios.diaPago} a las ${horarios.horaPago}` }
    ]
  })

  const analysisCreditInfo = computed(() => {
    if (!selectedLoanRequest.value) return []
   return [
      { label: 'Conclusiones', value: selectedLoanRequest.value.analisisFiltrado.analisisFiltrado || '' }
   ]
  })

  // Checks information computed
  const checksInfo = computed((): Checks => {
    if (!selectedLoanRequest.value) return {
      gerente: { check: null, check_date: null, check_by: null, nota: "" },
      oficina: { check: null, check_date: null, check_by: null, nota: "" },
      direccion: { check: null, check_date: null, check_by: null, nota: "" },
      seguridad: { check: null, check_date: null, check_by: null, nota: "" }
    }
    return selectedLoanRequest.value.checks
  })

  return {
    // Detail sections
    addressInfo,
    analysisCreditInfo,
    checksInfo,
    clientDocuments,
    clientInfo,
    creditInfo,
    guarantorDocuments,
    guarantorInfo,
    scheduleInfo,
  }
}