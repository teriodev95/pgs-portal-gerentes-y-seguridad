/**
 * Construye un payload limpio eliminando campos vacíos
 * @param data - Objeto con los datos del formulario
 * @returns Objeto con solo los campos que tienen valores
 */
export function buildCleanPayload<T extends Record<string, any>>(
  data: T
): Partial<T> {
  const payload: Partial<T> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined && value !== '') {
      // Si es string, trim y verificar que no esté vacío
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed) {
          payload[key as keyof T] = trimmed as any
        }
      } else {
        payload[key as keyof T] = value
      }
    }
  }

  return payload
}
