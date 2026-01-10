import { ref, watch, type Ref } from 'vue'
import { useStore } from '@/shared/stores'
import { promissoryNoteService } from '../services/promissory-note.service'
import { formatDateTimeToSql } from '../utils/date-formatter'
import { buildCleanPayload } from '../utils/payload-builder'
import type { Pagare } from '../types'

interface FormData {
  lugar_entrega: string
  observaciones: string
  fecha_entrega_pagare: string
  nombre_quien_recibio: string
  parentesco_quien_recibio: string
  entregado_cliente_at: string
  entregado_cliente_by: string
  recibido_oficina_at: string
  recibido_oficina_by: string
}

const PARENTESCO_OPTIONS = [
  'Titular',
  'Esposo/a',
  'Hijo/a',
  'Padre/Madre',
  'Hermano/a',
  'Abuelo/a',
  'Tío/a',
  'Primo/a',
  'Suegro/a',
  'Yerno/Nuera',
  'Cuñado/a',
  'Vecino/a',
  'Amigo/a',
  'Otro'
] as const

export function usePromissoryNoteDetail(pagareRef: Ref<Pagare | null>) {
  const store = useStore()

  const formData = ref<FormData>({
    lugar_entrega: '',
    observaciones: '',
    fecha_entrega_pagare: '',
    nombre_quien_recibio: '',
    parentesco_quien_recibio: '',
    entregado_cliente_at: '',
    entregado_cliente_by: '',
    recibido_oficina_at: '',
    recibido_oficina_by: ''
  })

  const isSaving = ref(false)
  const error = ref<string | null>(null)

  // Reset form when pagare changes
  watch(
    pagareRef,
    (newPagare) => {
      if (newPagare) {
        formData.value = {
          lugar_entrega: newPagare.lugar_entrega || '',
          observaciones: newPagare.observaciones || '',
          fecha_entrega_pagare: newPagare.fecha_entrega_pagare || '',
          nombre_quien_recibio: newPagare.nombre_quien_recibio || '',
          parentesco_quien_recibio: newPagare.parentesco_quien_recibio || '',
          entregado_cliente_at: newPagare.entregado_cliente_at || '',
          entregado_cliente_by: newPagare.entregado_cliente_by || '',
          recibido_oficina_at: newPagare.recibido_oficina_at || '',
          recibido_oficina_by: newPagare.recibido_oficina_by || ''
        }
      }
    },
    { immediate: true }
  )

  const buildUpdatePayload = () => {
    // Construir payload con campos editables
    const cleanPayload = buildCleanPayload({
      lugar_entrega: formData.value.lugar_entrega,
      observaciones: formData.value.observaciones,
      fecha_entrega_pagare: formData.value.fecha_entrega_pagare,
      nombre_quien_recibio: formData.value.nombre_quien_recibio,
      parentesco_quien_recibio: formData.value.parentesco_quien_recibio,
      recibido_oficina_at: formData.value.recibido_oficina_at,
      recibido_oficina_by: formData.value.recibido_oficina_by
    })

    // Agregar campos automáticos
    return {
      ...cleanPayload,
      entregado: true,
      entregado_cliente_by: store.user?.nombre || '',
      entregado_cliente_at: formatDateTimeToSql()
    }
  }

  const save = async (): Promise<boolean> => {
    if (!pagareRef.value?.id) {
      error.value = 'No se puede guardar: falta el ID del pagaré'
      console.error(error.value)
      return false
    }

    try {
      isSaving.value = true
      error.value = null

      const payload = buildUpdatePayload()
      console.log('Payload a enviar:', payload)

      await promissoryNoteService.updatePagare(pagareRef.value.id.toString(), payload)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al guardar pagaré'
      console.error('Error al guardar pagaré:', err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  return {
    formData,
    isSaving,
    error,
    parentescoOptions: PARENTESCO_OPTIONS,
    save
  }
}
