import { createApiClientFromPreset } from '@/shared/services/core'
import type { CorrectionRequest } from '../types'

class CorrectionService {
  private apiClient = createApiClientFromPreset('hono')

  async correctionsCreateOne(correction: CorrectionRequest, onClose?: () => void) {
    return this.apiClient.post(`/correcciones`, correction, {
      meta: {
        successNotification: {
          mainText: '¡Corrección enviada con éxito! h',
          secondaryText: 'Tu corrección ha sido registrada correctamente. La revisaremos y procesaremos lo antes posible.',
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