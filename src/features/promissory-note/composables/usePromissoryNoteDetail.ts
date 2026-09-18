import { computed, ref, watch, type Ref } from 'vue'
import { useStore } from '@/shared/stores'
import { promissoryNoteService } from '../services/promissory-note.service'
import { fechaDeHoy, formatDateTimeToSql } from '../utils/date-formatter'
import type { PagarePendiente, RegistrarEntregaPayload } from '../types'

/**
 * Los tres parentescos que resuelven casi todas las entregas van como botones, y
 * el resto detras de "Otro". En el telefono, abrir una lista de catorce para
 * elegir "Titular" cuesta tres gestos donde deberia costar uno.
 */
export const PARENTESCOS_FRECUENTES = ['Titular', 'Esposo/a', 'Hijo/a'] as const

export const PARENTESCOS_RESTANTES = [
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

interface FormData {
  nombre_quien_recibio: string
  parentesco_quien_recibio: string
  fecha_entrega_pagare: string
  observaciones: string
}

export function usePromissoryNoteDetail(pagareRef: Ref<PagarePendiente | null>) {
  const store = useStore()

  const formData = ref<FormData>({
    nombre_quien_recibio: '',
    parentesco_quien_recibio: '',
    fecha_entrega_pagare: '',
    observaciones: ''
  })

  const isSaving = ref(false)
  const error = ref<string | null>(null)
  /** La lista larga de parentescos solo aparece cuando se pide. */
  const verTodosParentescos = ref(false)
  const verObservaciones = ref(false)

  watch(
    pagareRef,
    (pagare) => {
      if (!pagare) return

      formData.value = {
        nombre_quien_recibio: pagare.nombre_quien_recibio ?? '',
        parentesco_quien_recibio: pagare.parentesco_quien_recibio ?? '',
        // La entrega y su captura pasan el mismo dia casi siempre; queda editable
        // para el gerente que las anota por la noche.
        fecha_entrega_pagare: pagare.fecha_entrega_pagare ?? fechaDeHoy(),
        observaciones: pagare.observaciones ?? ''
      }

      const parentesco = pagare.parentesco_quien_recibio ?? ''
      verTodosParentescos.value =
        !!parentesco && !PARENTESCOS_FRECUENTES.includes(parentesco as never)
      verObservaciones.value = !!pagare.observaciones
    },
    { immediate: true }
  )

  /** Ya registrada: el boton deja de prometer algo nuevo y ofrece corregir. */
  const esActualizacion = computed(() => !!pagareRef.value?.nombre_quien_recibio?.trim())

  const puedeGuardar = computed(() => !!formData.value.nombre_quien_recibio.trim())

  const buildPayload = (): RegistrarEntregaPayload => {
    const payload: RegistrarEntregaPayload = {
      nombre_quien_recibio: formData.value.nombre_quien_recibio.trim(),
      entregado: true,
      entregado_cliente_at: formatDateTimeToSql(),
      entregado_cliente_by: store.user?.nombre || ''
    }

    // Solo viaja lo que el gerente realmente lleno: un string vacio borraria en la
    // base el dato que el pagare ya traia.
    const parentesco = formData.value.parentesco_quien_recibio.trim()
    const fecha = formData.value.fecha_entrega_pagare.trim()
    const observaciones = formData.value.observaciones.trim()

    if (parentesco) payload.parentesco_quien_recibio = parentesco
    if (fecha) payload.fecha_entrega_pagare = fecha
    if (observaciones) payload.observaciones = observaciones

    return payload
  }

  const save = async (onSuccess?: () => void): Promise<boolean> => {
    const idSistemas = pagareRef.value?.id_sistemas
    if (!idSistemas) {
      error.value = 'No se puede guardar: falta el ID del pagaré'
      console.error(error.value)
      return false
    }
    if (!puedeGuardar.value) {
      error.value = 'Escribe el nombre de quien recibió el pagaré'
      return false
    }

    try {
      isSaving.value = true
      error.value = null
      await promissoryNoteService.registrarEntrega(idSistemas, buildPayload(), onSuccess)
      return true
    } catch (err) {
      console.error('Error al registrar la entrega:', err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  return {
    error,
    esActualizacion,
    formData,
    isSaving,
    puedeGuardar,
    save,
    verObservaciones,
    verTodosParentescos
  }
}
