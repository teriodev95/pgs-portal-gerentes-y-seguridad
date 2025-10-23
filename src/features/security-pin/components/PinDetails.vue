<script setup lang="ts">
import CardContainer from '@/shared/components/CardContainer.vue';
import { computed } from 'vue';

interface Props {
  user: string
  pin: string
  toEnd: string
  management: string
}

const props = defineProps<Props>()

const formattedEndTime = computed(() => {
  const date = new Date(props.toEnd)
  // Restar 6 horas (6 * 60 * 60 * 1000 milisegundos)
  const adjustedDate = new Date(date.getTime() - (6 * 60 * 60 * 1000))
  return adjustedDate.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
})

</script>
<template>
  <CardContainer>
    <h2 class="property-value">🔐 PIN de Seguridad Temporal</h2>
    <p class="property-label">El PIN {{ pin }}, generado por el usuario {{ user }}, será válido hasta las {{ formattedEndTime }} para los cierres de la gerencia {{ management }}.</p>
    <h2 class="property-value">⚠️ Importante: este PIN no es un comodín y debe utilizarse solo en casos específicos y justificados.</h2>
    <p class="property-label">Toda acción relacionada quedará registrada para auditorías y control interno. En caso de solicitudes recurrentes o uso indebido, oficina y dirección podrán revisar los registros y aplicar sanciones correspondientes.</p>
    <h2 class="property-value">🔒 Utilice este código con precaución y discreción.</h2>
  </CardContainer>
</template>
