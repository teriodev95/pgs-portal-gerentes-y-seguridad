import { describe, expect, test } from 'bun:test'
import { bienesValuados } from '../utils/bienes-valuados'
import { normalizeSolicitud } from '../services/solim.mapper'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(n)

describe('bienesValuados', () => {
  test('lista electrodomésticos capturados y bienes adicionales con su valor y el total', () => {
    const items = bienesValuados(
      {
        pantalla_tv: { marca: 'Samsung', antiguedad: '2 años', valor: 6000 },
        refrigerador: { marca: 'Mabe', valor: 5000 },
        lavadora_ropa: { marca: null, valor: null }
      },
      [{ tipo: 'Herramienta', descripcion: 'Máquina de coser', valor: 7000 }]
    )
    expect(items).toEqual([
      { label: 'Refrigerador', value: `Mabe · ${fmt(5000)}` },
      { label: 'Pantalla de TV', value: `Samsung · 2 años · ${fmt(6000)}` },
      { label: 'Herramienta', value: `Máquina de coser · ${fmt(7000)}` },
      { label: 'Valor total', value: fmt(18000) }
    ])
  })

  test('sin datos no muestra nada', () => {
    expect(bienesValuados(null, null)).toEqual([])
    expect(bienesValuados({ vivienda_tipo: 'Propia' }, [])).toEqual([])
  })
})

describe('normalizeSolicitud garantías', () => {
  test('toma los bienes adicionales de captura (lista o JSON en texto)', () => {
    const s = normalizeSolicitud({
      id: 'x',
      captura: {
        cliente: { garantias: [{ tipo: 'Vehículo', descripcion: 'Montoneta', valor: 25000 }] },
        aval: { garantias: JSON.stringify([{ tipo: 'Mobiliario', descripcion: 'Estufa', valor: '4800' }]) }
      }
    })
    expect(s.cliente_garantias).toEqual([{ id: null, tipo: 'Vehículo', descripcion: 'Montoneta', valor: 25000 }])
    expect(s.aval_garantias).toEqual([{ id: null, tipo: 'Mobiliario', descripcion: 'Estufa', valor: 4800 }])
  })
})
