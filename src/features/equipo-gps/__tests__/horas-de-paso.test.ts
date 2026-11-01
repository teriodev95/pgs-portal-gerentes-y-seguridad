// Horas de paso (v6): marcas de reloj sobre la línea y «¿A qué hora pasó por aquí?». Se corre con `bun test src`.
// Las pruebas de `passesNear` y `passLabel` son el puerto de MOX `modules/rastreo-gps/tests/monitor.test.mjs`.
import { describe, expect, it } from 'bun:test'
import {
  HORAS_MAX, HORAS_MARGEN_PX, HORAS_SEPARACION_PX, marcasDeHora, passesNear, passLabel, proyectar, puntosDeHora,
  sliceDay, spread, ZOOM_HORAS, type PuntoHora, type Rect
} from '../equipo-gps.helpers'
import type { RecorridoHoy, Vertice } from '../equipo-gps.types'

const DIA = '2026-10-31'
const at = (min: number) => new Date(Date.parse(`${DIA}T07:00:00-06:00`) + min * 60_000).toISOString()
/** Grados de longitud que miden `px` píxeles en ese zoom (Web Mercator, 256 px por tesela). */
const gradosPorPx = (zoom: number) => 360 / (256 * 2 ** zoom)
const LAT = 19.0
/** Fijos sobre una calle recta este→oeste: uno cada `pasoPx` píxeles del zoom dado, uno por minuto. */
function calle(n: number, pasoPx: number, zoom: number, desde = 0, lat = LAT, min0 = 0): Vertice[] {
  return Array.from({ length: n }, (_, i) => [lat, -98 + (desde + i * pasoPx) * gradosPorPx(zoom), at(min0 + i), 8])
}
const TODO: Rect = { minX: -Infinity, minY: -Infinity, maxX: Infinity, maxY: Infinity }
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
const recorrido = (tramos: RecorridoHoy['tramos'], paradas: RecorridoHoy['paradas'] = []): RecorridoHoy => ({
  user_id: 210, fecha: DIA, desde: at(0), hasta: at(600), telefono: null, tramos, paradas, huecos: [],
  resumen: { distancia_m: 0, puntos: 0, paradas: paradas.length }, server_time: at(600)
})

describe('Marcas de reloj sobre la línea', () => {
  it('van separadas al menos 150 px a lo largo de la ruta y como mucho son 8', () => {
    const puntos = puntosDeHora([{ puntos: calle(80, 50, 16) }], 16)
    const marcas = marcasDeHora(puntos, 16, TODO, [])
    expect(marcas.length).toBe(HORAS_MAX)
    for (const a of marcas) for (const b of marcas) if (a !== b) expect(dist(a, b)).toBeGreaterThanOrEqual(HORAS_SEPARACION_PX)
    // Con pocos fijos (cada 200 px) cada uno lleva marca: el espaciado es un mínimo, no una cuota.
    expect(marcasDeHora(puntosDeHora([{ puntos: calle(5, 200, 16) }], 16), 16, TODO, []).length).toBe(5)
  })
  it('por debajo de zoom 15 no hay marcas; desde 15 sí', () => {
    const tramos = [{ puntos: calle(40, 60, 15) }]
    expect(marcasDeHora(puntosDeHora(tramos, 14), 14, TODO, [])).toEqual([])
    expect(marcasDeHora(puntosDeHora(tramos, ZOOM_HORAS), ZOOM_HORAS, TODO, []).length).toBeGreaterThan(0)
  })
  it('las marcas salen de fijos reales con su recorded_at, nunca de un tramo estimado', () => {
    const [a, b, c, d]: Vertice[] = [[LAT, -98, at(0), 8], [LAT, -98 + 200 * gradosPorPx(16), at(2), 8], [LAT, -98 + 900 * gradosPorPx(16), at(20), 8], [LAT, -98 + 1100 * gradosPorPx(16), at(22), 8]]
    const puntos = puntosDeHora([{ puntos: [a, b, c, d], estimado: [[b[2], c[2], 18 * 60]] }], 16)
    const [bx, cx] = [proyectar(b[0], b[1], 16)[0], proyectar(c[0], c[1], 16)[0]]
    // Ni marcas ni puntos de toque dentro del tramo punteado.
    for (const p of puntos) expect(p.x <= bx + 0.01 || p.x >= cx - 0.01).toBe(true)
    const horas = marcasDeHora(puntos, 16, TODO, []).map((m) => m.time)
    for (const t of horas) expect([a, b, c, d].map((v) => Date.parse(v[2]))).toContain(t)
    // Un tramo que es sólo un estimado (dos fijos y nada en medio) no lleva ninguna marca.
    expect(marcasDeHora(puntosDeHora([{ puntos: [a, c], estimado: [[a[2], c[2], 20 * 60]] }], 16), 16, TODO, [])).toEqual([])
  })
  it('ninguna a menos de 40 px de una parada ni de Inicio/Fin, y sólo lo que cae en la vista', () => {
    const fijos = calle(60, 25, 16)
    const puntos = puntosDeHora([{ puntos: fijos }], 16)
    const [x0, y0] = proyectar(fijos[0][0], fijos[0][1], 16)
    const parada = { x: x0 + 700, y: y0 }
    const inicio = { x: x0, y: y0 }
    const fin = { x: x0 + 59 * 25, y: y0 }
    const marcas = marcasDeHora(puntos, 16, TODO, [parada, inicio, fin])
    expect(marcas.length).toBeGreaterThan(0)
    for (const m of marcas) for (const q of [parada, inicio, fin]) expect(dist(m, q)).toBeGreaterThanOrEqual(HORAS_MARGEN_PX)
    // Un protegido con etiqueta fija pide más aire con `r`.
    for (const m of marcasDeHora(puntos, 16, TODO, [{ ...parada, r: 120 }])) expect(dist(m, parada)).toBeGreaterThanOrEqual(120)
    const vista: Rect = { minX: x0 + 300, maxX: x0 + 800, minY: y0 - 50, maxY: y0 + 50 }
    for (const m of marcasDeHora(puntos, 16, vista, [])) expect(m.x >= vista.minX && m.x <= vista.maxX).toBe(true)
  })
  it('si la ruta pasa dos veces por el mismo lugar queda una sola marca', () => {
    const ida = calle(30, 50, 16)
    const vuelta = calle(30, 50, 16, 0, LAT, 60).reverse().map((v, i) => [v[0], v[1], at(60 + i), v[3]] as Vertice)
    const marcas = marcasDeHora(puntosDeHora([{ puntos: [...ida, ...vuelta] }], 16), 16, TODO, [])
    for (const a of marcas) for (const b of marcas) if (a !== b) expect(dist(a, b)).toBeGreaterThanOrEqual(HORAS_SEPARACION_PX)
    expect(marcas.length).toBeLessThanOrEqual(HORAS_MAX)
  })
  it('con la línea ajustada a calles la marca cae sobre la calle, no sobre el fijo crudo', () => {
    const fijos = calle(10, 100, 16, 0, LAT + 20 * gradosPorPx(16)) // 20 px al norte de la calle
    const ajustado = Array.from({ length: 10 }, (_, i) => [LAT, -98 + i * 100 * gradosPorPx(16)] as [number, number])
    const puntos = puntosDeHora([{ puntos: fijos, ajustado }], 16)
    const yCalle = proyectar(LAT, -98, 16)[1]
    for (const p of puntos) expect(Math.abs(p.y - yCalle)).toBeLessThan(0.01)
    const reales = puntos.filter((p) => p.real)
    expect(reales.length).toBe(10)
    reales.forEach((p, i) => expect(Math.abs(proyectar(p.lat, p.lon, 16)[0] - proyectar(LAT, ajustado[i][1], 16)[0])).toBeLessThan(0.01))
    // Entre fijos se intercalan puntos de toque con hora interpolada, en orden.
    for (let i = 1; i < puntos.length; i++) expect(puntos[i].time).toBeGreaterThanOrEqual(puntos[i - 1].time)
    expect(puntos.some((p) => !p.real)).toBe(true)
  })
  it('en una ida y vuelta por la misma calle ajustada cada fijo cae en su pasada, no salta a la vuelta', () => {
    // La calle va 10 cuadras al este y regresa por la misma línea; los fijos siguen ese orden en el tiempo.
    const ida = Array.from({ length: 10 }, (_, i) => [LAT, -98 + i * 100 * gradosPorPx(16)] as [number, number])
    const ajustado = [...ida, ...[...ida].reverse().slice(1)]
    const fijos = ajustado.map(([lat, lon], i) => [lat + 6 * gradosPorPx(16), lon + (i % 9 === 0 ? 0 : ((i % 2) - 0.5) * 20) * gradosPorPx(16), at(i), 8] as Vertice)
    const reales = puntosDeHora([{ puntos: fijos, ajustado }], 16).filter((p) => p.real)
    expect(reales.length).toBe(fijos.length)
    reales.forEach((p, i) => {
      const [x] = proyectar(fijos[i][0], fijos[i][1], 16)
      expect(Math.abs(p.x - x)).toBeLessThan(1)
      if (i) expect(p.s).toBeGreaterThanOrEqual(reales[i - 1].s)
    })
    // Un fijo lejos de la calle (la línea terminó antes) se queda en su sitio y sin marca.
    const lejos: Vertice = [LAT, -98 + 2000 * gradosPorPx(16), at(30), 8]
    const todos = puntosDeHora([{ puntos: [...fijos, lejos], ajustado }], 16)
    const ultimo = todos[todos.length - 1]
    expect(ultimo.solido).toBe(false)
    expect(Math.abs(ultimo.x - proyectar(lejos[0], lejos[1], 16)[0])).toBeLessThan(0.01)
    expect(marcasDeHora(todos, 16, TODO, []).some((m) => m.time === ultimo.time)).toBe(false)
  })
  it('el filtro de horas deja sólo marcas y pasadas dentro del rango', () => {
    const dia = recorrido([{ puntos: calle(120, 30, 16) }]) // 07:00–08:59
    const desde = Date.parse(at(30))
    const hasta = Date.parse(at(90))
    const corte = sliceDay(dia, { from: desde, to: hasta })
    const puntos = puntosDeHora(corte.tramos, 16)
    for (const p of puntos) expect(p.time >= desde && p.time <= hasta).toBe(true)
    for (const m of marcasDeHora(puntos, 16, TODO, [])) expect(m.time >= desde && m.time <= hasta).toBe(true)
    const [x, y] = proyectar(LAT, -98 + 10 * 30 * gradosPorPx(16), 16) // el minuto 10, fuera del rango
    expect(passesNear(puntos, { x, y })!.passes.every((p) => p.time >= desde)).toBe(true)
  })
  it('10 mil puntos: proyectar y elegir marcas en menos de 8 ms', () => {
    const puntos: PuntoHora[] = Array.from({ length: 10_000 }, (_, i) => ({
      x: (i * 7) % 900, y: (i * 13) % 700, s: i * 10, tramo: 0, time: Date.parse(at(i / 10)), lat: 0, lon: 0, real: true, solido: true
    }))
    const protegidos = Array.from({ length: 12 }, (_, i) => ({ x: i * 70, y: i * 50 }))
    const vista: Rect = { minX: 0, minY: 0, maxX: 900, maxY: 700 }
    marcasDeHora(puntos, 16, vista, protegidos)
    const inicio = performance.now()
    for (let i = 0; i < 20; i++) marcasDeHora(puntos, 16, vista, protegidos)
    expect((performance.now() - inicio) / 20).toBeLessThan(8)
    const t0 = performance.now()
    const proyectados = puntosDeHora([{ puntos: calle(10_000, 12, 15) }], 15)
    expect(performance.now() - t0).toBeLessThan(80)
    expect(proyectados.filter((p) => p.real).length).toBe(10_000)
  })
  it('spread reparte parejo', () => {
    expect(spread([1, 2, 3], 5)).toEqual([1, 2, 3])
    expect(spread([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)).toEqual([1, 3, 5, 7, 9])
  })
})

describe('Tocar la ruta: ¿a qué hora pasó por aquí? (puerto de MOX)', () => {
  const ms = (min: number) => Date.parse(at(min))
  const go = Array.from({ length: 20 }, (_, i) => ({ x: i * 30, y: 0, time: ms(i) }))
  const back = Array.from({ length: 20 }, (_, i) => ({ x: (19 - i) * 30, y: 2, time: ms(148 + i) }))
  it('ida y vuelta por la misma calle da las dos horas', () => {
    const found = passesNear([...go, ...back], { x: 302, y: -3 })!
    expect(found.at).toBe(go[10])
    expect(found.passes).toEqual([go[10], back[9]])
    expect(passLabel(found.passes.map((p) => `${new Date(p.time).getUTCHours()}`))).toContain(' y a las ')
  })
  it('una parada o un cruce lento cerca del lugar es una sola pasada', () => {
    const still = Array.from({ length: 28 }, (_, i) => ({ x: 300 + (i % 3), y: 1, time: ms(13 + i * 3) }))
    const onward = go.slice(11).map((point) => ({ ...point, time: point.time + 85 * 60_000 }))
    expect(passesNear([...go.slice(0, 11), ...still, ...onward], { x: 300, y: 0 })!.passes.length).toBe(1)
    const loop = [{ x: 300, y: 0, time: ms(0) }, { x: 900, y: 0, time: ms(4) }, { x: 300, y: 0, time: ms(9) }]
    expect(passesNear(loop, { x: 300, y: 0 })!.passes.length).toBe(1)
    loop[2].time = ms(11)
    expect(passesNear(loop, { x: 300, y: 0 })!.passes.length).toBe(2)
  })
  it('sin puntos no hay etiqueta, y 10,000 puntos no traban el mapa', () => {
    expect(passesNear([], { x: 0, y: 0 })).toBeNull()
    const day = Array.from({ length: 10_000 }, (_, i) => ({ x: (i * 7) % 900, y: (i * 13) % 700, time: ms(i / 10) }))
    const started = performance.now()
    for (let i = 0; i < 50; i++) passesNear(day, { x: i * 10, y: i * 5 })
    expect((performance.now() - started) / 50).toBeLessThan(8)
  })
  it('con la línea ajustada, ida y vuelta por la misma calle da dos horas en el punto tocado', () => {
    const ajustado = Array.from({ length: 10 }, (_, i) => [LAT, -98 + i * 100 * gradosPorPx(16)] as [number, number])
    const ida = calle(10, 100, 16, 0, LAT + 10 * gradosPorPx(16))
    const vuelta = calle(10, 100, 16, 0, LAT - 10 * gradosPorPx(16), 60).reverse().map((v, i) => [v[0], v[1], at(60 + i), v[3]] as Vertice)
    const puntos = puntosDeHora([{ puntos: ida, ajustado }, { puntos: vuelta, ajustado: [...ajustado].reverse() }], 16)
    const [x, y] = proyectar(LAT, -98 + 450 * gradosPorPx(16), 16) // a media cuadra entre dos fijos
    const found = passesNear(puntos, { x, y })!
    expect(dist(found.at, { x, y })).toBeLessThanOrEqual(20)
    expect(found.passes.length).toBe(2)
    // La hora del punto tocado es la interpolada entre los dos fijos reales que lo rodean (4.5 min y 64.5 min).
    expect(Math.abs(found.passes[0].time - ms(4.5))).toBeLessThan(30_000)
    expect(Math.abs(found.passes[1].time - ms(64.5))).toBeLessThan(30_000)
  })
  it('lista todas las horas en una frase', () => {
    expect(passLabel(['15:42'])).toBe('Pasó a las 15:42')
    expect(passLabel(['14:52', '17:20'])).toBe('Pasó a las 14:52 y a las 17:20')
    expect(passLabel(['09:05', '14:52', '17:20'])).toBe('Pasó a las 09:05, a las 14:52 y a las 17:20')
  })
})
