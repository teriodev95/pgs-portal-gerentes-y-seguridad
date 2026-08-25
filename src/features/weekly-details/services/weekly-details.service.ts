import { createApiClientFromPreset } from '@/shared/services/core'
import type {
  IGeneralBalance,
  IManagementNumbers,
  IWeeklyDetails
} from '@/interfaces'

class WeeklyDetailsService {
  //private mainV2Client = createApiClientFromPreset('mainV2')
  private fastApiClient = createApiClientFromPreset('fastApi')
  private elysiaClient = createApiClientFromPreset('elysia')
  private readonly STATIC_TOKEN = 'c4u&S7HizL5!PU$5c2gwYastgMs5%RUViAbK'

  /*
  async getGeneralBalance(management: string) {
    return this.mainV2Client.get<IGeneralBalance>(
      `/detalles-cierres-agencias/gerencia/${management}`,
      {
        headers: {
          staticToken: this.STATIC_TOKEN
        }
      }
    )
  }

  async getManagementNumbers(management: string) {
    return this.mainV2Client.get<IManagementNumbers>(
      `/numeros-gerencias/gerencia/${management}`,
      {
        headers: {
          staticToken: this.STATIC_TOKEN
        }
      }
    )
  }
  
  */

  async getWeeklyDetails(management: string, week: number, anio: number) {
    return this.fastApiClient.get<IWeeklyDetails>(
      `/detalles-cierre/detalles-cierre/V2/${management}/${anio}/${week}`
    )
  }

  /**
   * PDF del cierre semanal, ya compuesto.
   *
   * Va contra Elysia y no contra el servicio de reportes porque ese pide llave, y
   * cualquier llave que use esta SPA acaba siendo legible en el bundle. Elysia la
   * guarda del lado del servidor y devuelve el PDF.
   *
   * `variante`: 'gerente' es la hoja que se firma; 'oficina' agrega el desglose
   * por agencia.
   */
  async getWeeklyClosingPdf(
    management: string,
    anio: number,
    week: number,
    variante: 'oficina' | 'gerente'
  ) {
    return this.elysiaClient.get<ArrayBuffer>(
      `/cierre-semanal/${management}/${anio}/${week}/pdf`,
      { params: { variante }, responseType: 'arraybuffer' }
    )
  }
}

export const weeklyDetailsService = new WeeklyDetailsService()