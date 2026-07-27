// Ubicaciones del historial: un pin por LUGAR, no por pago. Cobrar semana
// tras semana en el mismo domicilio produce lecturas GPS que se apilan y se
// tapan entre sí; agrupadas, el mapa responde la pregunta real: ¿siempre se
// cobró aquí, o hubo semanas cobradas lejos?

import type { IPayment } from '../types'

// Dos lecturas del MISMO domicilio llegan separadas por el error del GPS de
// un celular en zona urbana (visto en datos reales: 7–21 m entre semanas).
// A esa escala distinguir casas vecinas es imposible, así que el radio se
// elige para no partir un domicilio en varios pines.
const RADIO_MISMO_LUGAR_M = 30

const RADIO_TIERRA_M = 6371000

export interface PuntoPagos {
  key: string
  lat: number
  lng: number
  /** Pagos del lugar, del más reciente al más antiguo */
  pagos: IPayment[]
}

export interface UbicacionesHistorial {
  puntos: PuntoPagos[]
  /** Pagos que no se pueden dibujar: migrados o capturados sin señal */
  sinUbicacion: number
}

/** Coordenada utilizable: numérica, dentro de rango y distinta de (0,0) —
 *  el backend manda 0 cuando no hubo lectura, y (0,0) cae en el Atlántico */
export function coordenadaValida(pago: IPayment): boolean {
  const lat = Number(pago.lat)
  const lng = Number(pago.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat === 0 && lng === 0) return false
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180
}

/** Haversine: a escala de manzana cualquier aproximación sirve, pero esta no
 *  se rompe cerca de los polos ni cruzando el antimeridiano */
export function distanciaMetros(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * RADIO_TIERRA_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

function masReciente(a: IPayment, b: IPayment): number {
  return a.anio !== b.anio ? b.anio - a.anio : b.semana - a.semana
}

export function agruparPorUbicacion(historial: IPayment[]): UbicacionesHistorial {
  const conUbicacion: IPayment[] = []
  let sinUbicacion = 0

  for (const pago of historial) {
    if (coordenadaValida(pago)) conUbicacion.push(pago)
    else sinUbicacion++
  }

  // Del más reciente al más antiguo: el ancla de cada grupo termina siendo la
  // última lectura del lugar, así el pin cae donde se cobró la última vez.
  conUbicacion.sort(masReciente)

  const puntos: PuntoPagos[] = []

  for (const pago of conUbicacion) {
    const lat = Number(pago.lat)
    const lng = Number(pago.lng)

    // Agrupar por cercanía real y no por celda de rejilla: dos lecturas a 7 m
    // pueden caer en celdas distintas y partir el domicilio en dos pines.
    const cercano = puntos.find((p) => distanciaMetros(p, { lat, lng }) <= RADIO_MISMO_LUGAR_M)

    if (cercano) cercano.pagos.push(pago)
    else puntos.push({ key: pago.pagoId, lat, lng, pagos: [pago] })
  }

  return { puntos, sinUbicacion }
}
