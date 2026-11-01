// Flechas de sentido (v6b): puerto de MOX `heading`/`pathArrows` con sus pruebas, y cuáles se ven en PGS.
import { describe, expect, it } from 'bun:test'
import {
  FLECHAS_MARGEN_PX, FLECHAS_MAX, FLECHAS_MINIMO_PX, FLECHAS_SEPARACION_PX, flechasVisibles, heading, pathArrows,
  proyectar, proyectarDia, sliceDay, spread, type Rect
} from '../equipo-gps.helpers'
import type { RecorridoHoy, Vertice } from '../equipo-gps.types'

const DIA = '2026-10-31'
const at = (min: number) => new Date(Date.parse(`${DIA}T07:00:00-06:00`) + min * 60_000).toISOString()
const gradosPorPx = (zoom: number) => 360 / (256 * 2 ** zoom)
const LAT = 19.0
const calle = (n: number, pasoPx: number, zoom: number, min0 = 0): Vertice[] =>
  Array.from({ length: n }, (_, i) => [LAT, -98 + i * pasoPx * gradosPorPx(zoom), at(min0 + i), 8])
const TODO: Rect = { minX: -Infinity, minY: -Infinity, maxX: Infinity, maxY: Infinity }
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)
const flechasDe = (tramos: RecorridoHoy['tramos'], zoom: number) => proyectarDia(tramos, zoom).lineas.flatMap((l) => pathArrows(l, FLECHAS_SEPARACION_PX))

describe('Flechas de sentido (puerto de MOX)', () => {
  it('el rumbo en pantalla va en grados desde arriba, como una brújula', () => {
    const origin = { x: 0, y: 0 }
    expect(heading(origin, { x: 0, y: -5 })).toBe(0)
    expect(heading(origin, { x: 5, y: 0 })).toBe(90)
    expect(heading(origin, { x: 0, y: 5 })).toBe(180)
    expect(heading(origin, { x: -5, y: 0 })).toBe(270)
  })
  it('las flechas van separadas por distancia en pantalla y apuntan hacia donde avanzó', () => {
    const east = [{ x: 0, y: 0 }, { x: 1000, y: 0 }]
    const arrows = pathArrows(east, 100)
    expect(arrows.length).toBe(10)
    expect([arrows[0].x, arrows[1].x]).toEqual([50, 150])
    expect(arrows.every((arrow) => arrow.angle === 90)).toBe(true)
    // De regreso por la misma línea, voltean.
    expect(pathArrows([...east].reverse(), 100).every((arrow) => arrow.angle === 270)).toBe(true)
    // El titubeo en una parada tiene largo pero no sentido: sin flechas.
    const jitter = Array.from({ length: 60 }, (_, i) => ({ x: i % 2 ? 30 : 0, y: 0 }))
    expect(pathArrows(jitter, 100).length).toBe(0)
    expect(pathArrows([{ x: 3, y: 3 }], 100)).toEqual([])
    // El tope reparte las flechas por toda la ruta, no sólo al inicio.
    expect(spread(arrows, 3).map((arrow) => arrow.x)).toEqual([50, 350, 650])
    expect(spread(arrows, 50)).toBe(arrows)
  })
  it('sobre la línea dibujada siguen el orden del tiempo: cruda o ajustada a calles', () => {
    const cruda = flechasDe([{ puntos: calle(30, 50, 16) }], 16)
    expect(cruda.length).toBeGreaterThan(5)
    expect(cruda.every((f) => Math.round(f.angle) === 90)).toBe(true)
    // La calle ajustada va al oeste aunque los fijos crudos vayan 20 px al norte: la flecha sigue la calle.
    const ajustado = Array.from({ length: 10 }, (_, i) => [LAT, -98 - i * 100 * gradosPorPx(16)] as [number, number])
    const fijos = ajustado.map(([lat, lon], i) => [lat + 20 * gradosPorPx(16), lon, at(i), 8] as Vertice)
    const sobreCalle = flechasDe([{ puntos: fijos, ajustado }], 16)
    expect(sobreCalle.every((f) => Math.round(f.angle) === 270)).toBe(true)
    const yCalle = proyectar(LAT, -98, 16)[1]
    for (const f of sobreCalle) expect(Math.abs(f.y - yCalle)).toBeLessThan(0.01)
  })
  it('nada en tramos estimados ni en huecos', () => {
    const [a, b, c, d]: Vertice[] = [[LAT, -98, at(0), 8], [LAT, -98 + 400 * gradosPorPx(16), at(4), 8], [LAT, -98 + 1200 * gradosPorPx(16), at(30), 8], [LAT, -98 + 1600 * gradosPorPx(16), at(34), 8]]
    const flechas = flechasDe([{ puntos: [a, b, c, d], estimado: [[b[2], c[2], 26 * 60]] }], 16)
    const [bx, cx] = [proyectar(b[0], b[1], 16)[0], proyectar(c[0], c[1], 16)[0]]
    expect(flechas.length).toBeGreaterThan(0)
    for (const f of flechas) expect(f.x < bx || f.x > cx).toBe(true)
    // Dos tramos con un hueco en medio: ninguna flecha entre el fin de uno y el inicio del otro.
    const t1 = calle(5, 100, 16)
    const t2 = calle(5, 100, 16, 60).map((v) => [v[0], v[1] + 2000 * gradosPorPx(16), v[2], v[3]] as Vertice)
    const conHueco = flechasDe([{ puntos: t1 }, { puntos: t2 }], 16)
    const finT1 = proyectar(t1[4][0], t1[4][1], 16)[0]
    const iniT2 = proyectar(t2[0][0], t2[0][1], 16)[0]
    for (const f of conHueco) expect(f.x <= finT1 || f.x >= iniT2).toBe(true)
  })
  it('como mucho 16 visibles, a ≥30 px entre sí y lejos de paradas, Inicio/Fin y marcas de hora', () => {
    // Ida de 27 × 110 px y vuelta por la misma calle (4 px al lado): las flechas de regreso caen sobre las de ida.
    const ida = calle(28, 110, 16)
    const vuelta = [...calle(28, 110, 16)].reverse().map((v, i) => [v[0] + 4 * gradosPorPx(16), v[1], at(60 + i), v[3]] as Vertice)
    const flechas = flechasDe([{ puntos: [...ida, ...vuelta] }], 16)
    expect(flechas.length).toBeGreaterThan(FLECHAS_MAX)
    const vistas = flechasVisibles(flechas, TODO, [])
    expect(vistas.length).toBe(FLECHAS_MAX)
    for (const a of vistas) for (const b of vistas) if (a !== b) expect(dist(a, b)).toBeGreaterThanOrEqual(FLECHAS_MINIMO_PX)
    // En la ida y vuelta por la misma calle se queda la primera (la de ida).
    expect(vistas.every((f) => Math.round(f.angle) === 90)).toBe(true)
    const [x0, y0] = proyectar(ida[0][0], ida[0][1], 16)
    const protegidos = [{ x: x0 + 155, y: y0 }, { x: x0 + 1000, y: y0, r: 64 }]
    for (const f of flechasVisibles(flechas, TODO, protegidos)) {
      expect(dist(f, protegidos[0])).toBeGreaterThanOrEqual(FLECHAS_MARGEN_PX)
      expect(dist(f, protegidos[1])).toBeGreaterThanOrEqual(64)
    }
    const vista: Rect = { minX: x0 + 500, maxX: x0 + 900, minY: y0 - 50, maxY: y0 + 50 }
    for (const f of flechasVisibles(flechas, vista, [])) expect(f.x >= vista.minX && f.x <= vista.maxX).toBe(true)
  })
  it('con el filtro de horas sólo hay flechas en el rango', () => {
    const dia: RecorridoHoy = {
      user_id: 210, fecha: DIA, desde: at(0), hasta: at(600), telefono: null, tramos: [{ puntos: calle(120, 30, 16) }], paradas: [], huecos: [],
      resumen: { distancia_m: 0, puntos: 120, paradas: 0 }, server_time: at(600)
    }
    const corte = sliceDay(dia, { from: Date.parse(at(30)), to: Date.parse(at(90)) })
    const flechas = flechasDe(corte.tramos, 16)
    expect(flechas.length).toBeGreaterThan(0)
    const [xDesde] = proyectar(LAT, -98 + 30 * 30 * gradosPorPx(16), 16)
    const [xHasta] = proyectar(LAT, -98 + 90 * 30 * gradosPorPx(16), 16)
    for (const f of flechas) expect(f.x >= xDesde && f.x <= xHasta).toBe(true)
  })
  it('10 mil puntos en menos de 8 ms', () => {
    const path = Array.from({ length: 10_000 }, (_, i) => ({ x: (i * 7) % 900, y: (i * 13) % 700 }))
    pathArrows(path, FLECHAS_SEPARACION_PX)
    const t0 = performance.now()
    const flechas = pathArrows(path, FLECHAS_SEPARACION_PX)
    const vistas = flechasVisibles(flechas, { minX: 0, minY: 0, maxX: 900, maxY: 700 }, Array.from({ length: 20 }, (_, i) => ({ x: i * 40, y: i * 30 })))
    expect(performance.now() - t0).toBeLessThan(8)
    expect(vistas.length).toBeLessThanOrEqual(FLECHAS_MAX)
  })
})
