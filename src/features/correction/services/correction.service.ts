import { createApiClientFromPreset } from '@/shared/services/core'
import type { CorrectionRequest } from '../types'

class CorrectionService {
  // Las correcciones las atiende xpress-elysia (POST /api/correcciones). El preset
  // `elysia` resuelve el baseURL por entorno e inyecta el Bearer (usuario:pin) vía interceptor.
  private apiClient = createApiClientFromPreset('elysia')

  async correctionsCreateOne(correction: CorrectionRequest, onClose?: () => void) {
    return this.apiClient.post(`/correcciones`, correction, {
      meta: {
        successNotification: {
          mainText: '¡Corrección enviada con éxito!',
          secondaryText: 'Recibimos tu corrección. Te avisaremos por WhatsApp cuando se aplique.',
          subText: '¿Tienes dudas? Contáctanos al número de soporte.',
          ctaText: 'Volver al inicio',
          onClose
        },
        // El composable maneja los errores: el 422 MOTIVO_REQUERIDO no debe mostrar el
        // diálogo genérico (pide motivo); los demás errores se notifican desde el composable.
        skipErrorNotification: true
      }
    })
  }
}

export const correctionService = new CorrectionService()