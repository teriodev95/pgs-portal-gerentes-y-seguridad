import { createApiClientFromPreset } from '@/shared/services/core'
import type { GetBaseProps } from '@/interfaces'
import type { IIncident } from '../types'

class IncidentService {
  private apiFax = createApiClientFromPreset('fastApi')

  async getIncidentByUserId({ year, week, userID }: GetBaseProps) {
    return this.apiFax.get<IIncident[]>(`/incidentes-reposiciones/usuarioId?usuario_id=${userID}&anio=${year}&semana=${week}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar incidentes',
          message: 'No se pudieron cargar los incidentes. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async createIncident(incident: IIncident) {
    return this.apiFax.post(`/incidentes-reposiciones/`, incident, {
      meta: {
        successNotification: {
          mainText: '¡Incidente registrado!',
          secondaryText: 'El incidente se ha guardado correctamente'
        },
        errorNotification: {
          title: 'Error al registrar incidente',
          message: 'No se pudo registrar el incidente. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }
}

export const incidentService = new IncidentService()
