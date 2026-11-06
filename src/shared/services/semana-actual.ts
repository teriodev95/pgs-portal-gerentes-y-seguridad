import { commonService } from '@/shared/services/modules'
import { MSG_SEMANA_NO_DISPONIBLE, validarSemanaActual, type ISemanaActual } from './semana-validacion'

export type { ISemanaActual }

export async function getSemanaActual(): Promise<ISemanaActual> {
  try {
    const { data } = await commonService.getCurrentDate()
    return validarSemanaActual(data)
  } catch {
    throw new Error(MSG_SEMANA_NO_DISPONIBLE)
  }
}
