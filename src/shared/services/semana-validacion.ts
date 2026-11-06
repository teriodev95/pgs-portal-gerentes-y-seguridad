export const MSG_SEMANA_NO_DISPONIBLE = 'No se pudo obtener la semana, intenta de nuevo'

export interface ISemanaActual {
  semana: number
  anio: number
}

// shortcut: solo valida rango (1..53, año >= 2000); no compara contra el calendario de FAX. Subir a validación contra FAX si aparece una semana inválida.
export function validarSemanaActual(data: unknown): ISemanaActual {
  const d = data as { semana?: unknown; anio?: unknown } | null | undefined
  const semana = Number(d?.semana)
  const anio = Number(d?.anio)
  if (!Number.isInteger(semana) || semana < 1 || semana > 53) throw new Error(MSG_SEMANA_NO_DISPONIBLE)
  if (!Number.isInteger(anio) || anio < 2000) throw new Error(MSG_SEMANA_NO_DISPONIBLE)
  return { semana, anio }
}
