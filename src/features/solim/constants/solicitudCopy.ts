/** Etapa de la solicitud como la lee el usuario. La usan la lista de solicitudes y el buzón de avisos. */
const STATUS_LABELS: Record<string, string> = {
  capturada: 'Capturada',
  en_filtrado: 'En evaluación',
  en_correccion: 'En corrección',
  en_vistos_buenos: 'En vistos buenos',
  lista_desembolso: 'Lista p/ desembolso',
  desembolsada: 'Desembolsada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada'
}

export function solicitudStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Sin status'
  return STATUS_LABELS[status] ?? status
}

/** Un color por significado: corrección ámbar, rechazo rojo, vistos buenos azul, listo verde, cancelada gris. */
const STATUS_TONES: Record<string, string> = {
  en_correccion: 'border-amber-200 bg-amber-50 text-amber-800',
  rechazada: 'border-red-200 bg-red-50 text-red-700',
  en_vistos_buenos: 'border-sky-200 bg-sky-50 text-sky-800',
  lista_desembolso: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  desembolsada: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  cancelada: 'border-slate-200 bg-slate-100 text-slate-600'
}

export function solicitudStatusTone(status: string | null | undefined): string {
  return (status && STATUS_TONES[status]) || 'border-slate-200 bg-white text-slate-600'
}

/** Temas que oficina puede pedir corregir (CORRECTION_SCOPES en Elysia). */
const CORRECTION_TOPIC_LABELS: Record<string, string> = {
  garantias_cliente: 'Garantías del cliente',
  garantias_aval: 'Garantías del aval',
  curp_cliente: 'CURP del cliente',
  curp_aval: 'CURP del aval',
  ine_cliente: 'INE del cliente',
  comprobante_cliente: 'Comprobante del cliente',
  ine_aval: 'INE del aval',
  comprobante_aval: 'Comprobante del aval',
  datos_cliente: 'Datos del cliente',
  datos_aval: 'Datos del aval',
  aval: 'Aval',
  documentos: 'Documentos',
  documentos_cliente: 'Documentos del cliente',
  documentos_aval: 'Documentos del aval'
}

export function correctionTopicLabel(topic: string): string {
  return CORRECTION_TOPIC_LABELS[topic] ?? topic.replace(/_/g, ' ')
}

/** El motivo suele ser solo la lista de temas; entonces no aporta nada al lado de los chips. */
export function isMotivoRedundant(motivo: string | null, temas: string[]): boolean {
  if (!motivo) return true
  const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim()
  return normalize(motivo) === normalize(temas.map(correctionTopicLabel).join(', '))
}
