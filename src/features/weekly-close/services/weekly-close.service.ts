import { createApiClientFromPreset } from '@/shared/services/core'
import type { AxiosResponse } from 'axios'
import type {
  IUploadVideoResponse,
  IWeeklyCloseWithIncome
} from '@/features/weekly-close/types'
import type { AgenciaDashboard, CreateNewWeeklyClose } from '@/features/weekly-close/types/new-weekly.types'
import type { GetBaseProps } from '@/interfaces'
import { toCurrency } from '@/shared/utils'


class WeeklyClosingService {
  private uploadVideoClient = createApiClientFromPreset('workerUploadVideo')
  private apiJavalin = createApiClientFromPreset('javalin')
  private apiElysia = createApiClientFromPreset('elysia')
  
  async uploadVideo(video: File) {
    const formData = new FormData()
    formData.append('video', video)
    return this.uploadVideoClient.post<IUploadVideoResponse>('/upload', formData, {
      meta: {
        errorNotification: {
          title: 'Error al subir video',
          message: 'No se pudo subir el video. Por favor, verifica el archivo e intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

  async getWeeklyClose({ agency, year, week }: GetBaseProps): Promise<AxiosResponse<IWeeklyCloseWithIncome>> {
    const response = await this.apiJavalin.get<AgenciaDashboard>(`/cierres-agencias/prefill?agencia=${agency}&anio=${year}&semana=${week}`, {
      meta: {
        errorNotification: {
          title: 'Error al cargar cierre semanal',
          message: 'No se pudo cargar la información del cierre semanal. Por favor, intenta nuevamente.',
          type: 'error'
        }
      }
    })

    const { referencia, dashboardAgencia, comisiones, cierre } = response.data

    const mappedData: IWeeklyCloseWithIncome = {
      resumenSemanal: {
        semana: referencia.semana,
        anio: referencia.anio,
        agencia: referencia.agencia,
        agente: referencia.agente,
        gerencia: referencia.gerencia,
        gerente: '', // No disponible en AgenciaDashboard
        clientes: dashboardAgencia.clientes,
        pagosReducidos: dashboardAgencia.pagosReducidos,
        noPagos: dashboardAgencia.noPagos,
        clientesLiquidados: dashboardAgencia.clientesLiquidados,
        rendimiento: dashboardAgencia.rendimiento
      },
      egresosAgente: {
        asignaciones: cierre.asignacionesPreviasEfectivo, // No disponible en AgenciaDashboard
        asignacionesNumero: dashboardAgencia.numeroAsignaciones,
        otrosEgresos: cierre.otrosEgresos,
        motivoOtrosEgresos: cierre.motivoOtrosEgresos || '',
        totalEgresosAgente: cierre.otrosEgresos + dashboardAgencia.asignaciones,
        efectivoEntregadoCierre: cierre.efectivoEntregadoCierre
      },
      egresosGerente: {
        comisionCobranzaPagadaEnSemana: comisiones.pagoComisionCobranza,
        comisionVentasPagadaEnSemana: comisiones.pagoComisionVentas,
        bonosPagadosEnSemana: comisiones.pagoBono.bonos,
        efectivoRestanteCierre: cierre.efectivoRestanteCierre,
        porcentajePorCobranzaPagadoEnSemana: comisiones.porcentajeComisionCobranza,
        porcentajePorBonoMensualPagadoEnSemana: comisiones.pagoBono.porcentajeBonoMensual
      },
      rendimientoFun: {
        debitoAplicable: dashboardAgencia.debitoAplicable,
        debitoGeneral: dashboardAgencia.debitoGeneral,
        debitoNoImpacta: dashboardAgencia.debitoNoImpacta,
        rendimientoGeneral: dashboardAgencia.rendimientoGeneral,
        totalPagado: dashboardAgencia.totalPagado
      },
      isSemanaBonos: {
        pagoBono: comisiones.pagoBono.aplicaPagoBono,
        mesAnterior: comisiones.pagoBono.mesBono || '',
        anioAnterior: referencia.anio,
        mesActual: referencia.mes,
        anioActual: referencia.anio
      },
      ingresosAgente: {
        cobranzaPura: dashboardAgencia.cobranzaPura,
        montoExcedente: dashboardAgencia.excedente,
        liquidaciones: dashboardAgencia.liquidaciones,
        multas: dashboardAgencia.multas,
        otrosIngresos: cierre.otrosIngresos,
        motivoOtrosIngresos: cierre.motivoOtrosIngresos || ''
      },
      comisiones: comisiones,
      agenciaCerrada: referencia.agenciaCerrada === 1,
      pinAgente: 0, // No disponible en AgenciaDashboard
      statusAgencia: referencia.statusAgencia as 'ACTIVA' | 'VACANTE',
      snapshot_regla_comision_id: cierre.snapshotReglaComisionId,
      id: cierre.cierreId ? parseInt(cierre.cierreId) : 0,
    }

    return {
      ...response,
      data: mappedData
    } as AxiosResponse<IWeeklyCloseWithIncome>
  }

  async createWeeklyClose(data: CreateNewWeeklyClose, agencyName: string, managementName: string, onClose?: () => void) {
    const summaryList = [
      `Comisión por cobranza: ${toCurrency(data.pago_comision_cobranza)}`,
      `Comisión por ventas: ${toCurrency(data.pago_comision_ventas)}`,
      `Bonos: ${toCurrency(data.bonos)}`
    ]

    return this.apiElysia.post('/cierres-agencias/', data, {
      meta: {
        successNotification: {
          mainText: 'Cierre semanal completado con éxito',
          secondaryText: `Agencia: <b>${agencyName}</b> - Gerencia: <b>${managementName}</b>`,
          subText: 'Resumen:',
          list: summaryList,
          onClose
        },
        errorNotification: {
          title: 'Error al crear cierre semanal',
          message: 'No se pudo completar el cierre semanal. Por favor, verifica los datos e intenta nuevamente.',
          type: 'error'
        }
      }
    })
  }

}

export const weeklyClosingService = new WeeklyClosingService()