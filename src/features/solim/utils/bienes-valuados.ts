import type { ActivosData, GarantiaAdicional } from '../types'

const ELECTRODOMESTICOS = [
  ['refrigerador', 'Refrigerador'],
  ['horno_microondas', 'Horno de microondas'],
  ['lavadora_ropa', 'Lavadora de ropa'],
  ['secadora_ropa', 'Secadora de ropa'],
  ['pantalla_tv', 'Pantalla de TV'],
  ['mini_componente', 'Mini componente'],
  ['computadora', 'Computadora'],
  ['consola_videojuegos', 'Consola de videojuegos']
] as const

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 })

export interface BienValuado {
  label: string
  value: string
}

function texto(value?: string | null) {
  return value?.trim() || ''
}

/**
 * Electrodomésticos y bienes adicionales con su valor, como los ve oficina en MOX.
 * Las pulgadas no tienen campo propio: salen solo si el agente las escribe en la descripción.
 */
export function bienesValuados(assets?: ActivosData | null, garantias?: GarantiaAdicional[] | null): BienValuado[] {
  const items: BienValuado[] = []
  let total = 0

  for (const [key, label] of ELECTRODOMESTICOS) {
    const item = assets?.[key]
    const valor = Number(item?.valor) || 0
    const detalle = [texto(item?.marca), texto(item?.antiguedad)].filter(Boolean)
    if (!valor && detalle.length === 0) continue
    total += valor
    items.push({ label, value: [...detalle, valor ? money.format(valor) : 'Sin valor'].join(' · ') })
  }

  for (const garantia of garantias ?? []) {
    const valor = Number(garantia.valor) || 0
    total += valor
    items.push({
      label: texto(garantia.tipo) || 'Bien adicional',
      value: [texto(garantia.descripcion) || 'Sin descripción', valor ? money.format(valor) : 'Sin valor'].join(' · ')
    })
  }

  if (items.length > 0) items.push({ label: 'Valor total', value: money.format(total) })
  return items
}
