<script setup lang="ts">
import useGeolocation from '@/shared/composables/useGeolocation'
import { useNotification } from '@/shared/composables/useNotification'
import type { VisitFormPayload } from '../composables/useAgendaVisits'

// Components
import CreateVisitBS from '@/features/call-center/components/CreateVisitBS.vue'

/**
 * La hoja de alta de visita del call center, tal cual. Aquí sólo se le agrega
 * la ubicación: ese componente la resuelve para sí mismo —permiso, mapa y
 * tutorial incluidos— pero no la emite.
 *
 * Se monta al abrir la hoja, no al entrar a la agenda: el permiso de ubicación
 * se pide cuando de verdad hace falta.
 */
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: VisitFormPayload): void
}>()

const { userLocation } = useGeolocation()
const { showError } = useNotification()

function submit(observaciones: string, status: string) {
  if (!userLocation.value) {
    showError('Todavía no tenemos tu ubicación. Espera un momento e intenta de nuevo.')
    return
  }

  emit('submit', {
    observaciones,
    status,
    lat: userLocation.value.lat,
    lng: userLocation.value.lng
  })
}
</script>

<template>
  <CreateVisitBS
    @action:cancel-visit="emit('close')"
    @action:close-bottom-sheet="emit('close')"
    @action:create-visit="submit"
  />
</template>
