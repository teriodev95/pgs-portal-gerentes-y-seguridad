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
        errorNotification: {
          title: 'Error al enviar corrección',
          message: 'No se pudo registrar la corrección. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const correctionService = new CorrectionService()