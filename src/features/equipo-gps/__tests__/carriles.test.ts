// Carriles por sentido (v6e): la línea sólida corrida 3 px a la derecha del avance, sin detectar nada.
import { describe, expect, it } from 'bun:test'
import { CARRIL_PX, desplazarLinea, gapLinks, proyectar, routeBands, tramosDesplazados, type Pixel } from '../equipo-gps.helpers'
import type { RecorridoHoy, Vertice } from '../equipo-gps.types'

const dist = (a: Pixel, b: Pixel) => Math.hypot(a.x - b.x, a.y - b.y)
/** Distancia de un punto a una polilínea. */
function aLinea(p: Pixel, linea: Pixel[]) {
  let mejor = Infinity
  for (let i = 1; i < linea.length; i++) {
    const a = linea[i - 1], b = linea[i]
    const dx = b.x - a.x, dy = b.y - a.y
    const l2 = dx * dx + dy * dy
    const t = l2 ? Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0
    mejor = Math.min(mejor, Math.hypot(a.x + dx * t - p.x, a.y + dy * t - p.y))
  }
  return mejor
}

describe('Carriles por sentido', () => {
  it('un segmento recto hacia el este queda 3 px a la derecha (abajo en pantalla); hacia el oeste, arriba', () => {
    expect(desplazarLinea([{ x: 0, y: 0 }, { x: 100, y: 0 }], 3)).toEqual([{ x: 0, y: 3 }, { x: 100, y: 3 }])
    expect(desplazarLinea([{ x: 100, y: 0 }, { x: 0, y: 0 }], 3)).toEqual([{ x: 100, y: -3 }, { x: 0, y: -3 }])
    // Hacia el norte (y decrece) la derecha es el este.
    expect(desplazarLinea([{ x: 0, y: 100 }, { x: 0, y: 0 }], 3)).toEqual([{ x: 3, y: 100 }, { x: 3, y: 0 }])
    expect(desplazarLinea([{ x: 5, y: 5 }], 3)).toEqual([{ x: 5, y: 5 }])
    expect(desplazarLinea([], 3)).toEqual([])
  })
  it('una ida y una vuelta por el mismo camino quedan en dos carriles separados 6 px', () => {
    const ida = [{ x: 0, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 200 }]
    const vuelta = [...ida].reverse()
    const a = desplazarLinea(ida, CARRIL_PX)
    const b = desplazarLinea(vuelta, CARRIL_PX)
    for (const p of a.slice(0, 1)) expect(dist(p, b[b.length - 1])).toBeCloseTo(6, 6)
    // Tramos rectos: el carril de ida va a 3 px de la original y el de vuelta a 3 px del otro lado (6 entre ellos).
    expect(aLinea({ x: 150, y: 3 }, a)).toBeCloseTo(0, 6)
    expect(aLinea({ x: 150, y: -3 }, b)).toBeCloseTo(0, 6)
    expect(aLinea({ x: 297, y: 100 }, a)).toBeCloseTo(0, 6)
    expect(aLinea({ x: 303, y: 100 }, b)).toBeCloseTo(0, 6)
  })
  it('en un codo a 90° la bisectriz mide ≤ 2 × px; en una vuelta en U no hay picos mayores que 6 px', () => {
    const codo = desplazarLinea([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }], 3)
    expect(codo.length).toBe(3)
    expect(dist(codo[1], { x: 100, y: 0 })).toBeCloseTo(3 * Math.SQRT2, 6)
    // Vuelta en U en una sola polilínea: ida al este, dos pasos de retorno y vuelta al oeste 4 px más abajo.
    const u = [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 4 }, { x: 0, y: 4 }]
    const d = desplazarLinea(u, 3)
    for (const p of d) expect(aLinea(p, u)).toBeLessThanOrEqual(6 + 1e-9)
    // Giro cerrado (180°): el inglete se limita, nunca un pico; y sale un punto por vértice.
    const horquilla = desplazarLinea([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 0.001 }], 3)
    expect(horquilla.length).toBe(3)
    for (const p of horquilla) expect(aLinea(p, [{ x: 0, y: 0 }, { x: 100, y: 0 }])).toBeLessThanOrEqual(6)
    // Un vértice repetido no rompe la correspondencia ni el desplazamiento.
    expect(desplazarLinea([{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 0 }, { x: 100, y: 0 }], 3).map((p) => p.y)).toEqual([3, 3, 3, 3])
  })
  it('10 mil puntos en menos de 8 ms', () => {
    const linea = Array.from({ length: 10_000 }, (_, i) => ({ x: i * 3 + Math.sin(i / 7) * 20, y: Math.cos(i / 11) * 40 }))
    desplazarLinea(linea, 3)
    const t0 = performance.now()
    const d = desplazarLinea(linea, 3)
    expect(performance.now() - t0).toBeLessThan(8)
    expect(d.length).toBe(10_000)
  })
  it('las bandas de color se cortan de la pieza ya desplazada: fin de la banda N = inicio de la N+1, y el punteado empata', () => {
    const DIA = '2026-10-31'
    const at = (min: number) => new Date(Date.parse(`${DIA}T07:00:00-06:00`) + min * 60_000).toISOString()
    const g = 360 / (256 * 2 ** 16)
    // Una calle al este con un codo al sur y un tramo estimado en medio (sin fijos entre el minuto 20 y el 30).
    const fijos: Vertice[] = Array.from({ length: 41 }, (_, i) => (i <= 20 ? [19, -98 + i * 40 * g, at(i), 8] : [19 - (i - 20) * 40 * g, -98 + 20 * 40 * g, at(i), 8]))
    const estimado: [string, string, number][] = [[fijos[20][2], fijos[21][2], 600]]
    const tramos = [{ puntos: fijos.slice(0, 21).concat(fijos.slice(21)), estimado }]
    const movidos = tramosDesplazados(tramos, 16, CARRIL_PX)
    const bandas = routeBands(movidos, 12)
    expect(bandas.length).toBeGreaterThan(2)
    for (let i = 1; i < bandas.length; i++) expect(bandas[i].points[0]).toEqual(bandas[i - 1].points[bandas[i - 1].points.length - 1])
    const punteada = bandas.find((b) => b.estimated)!
    expect(punteada).toBeDefined()
    const k = bandas.indexOf(punteada)
    expect(punteada.points[0]).toEqual(bandas[k - 1].points[bandas[k - 1].points.length - 1])
    expect(punteada.points[punteada.points.length - 1]).toEqual(bandas[k + 1].points[0])
    // Horas y precisión se conservan; la línea quedó 3 px al sur (derecha de quien va al este).
    expect(movidos[0].puntos.map((v) => v[2])).toEqual(fijos.map((v) => v[2]))
    const [, y0] = proyectar(fijos[5][0], fijos[5][1], 16)
    const [, y1] = proyectar(movidos[0].puntos[5][0], movidos[0].puntos[5][1], 16)
    expect(y1 - y0).toBeCloseTo(3, 3)
    // El hueco punteado entre dos tramos une los extremos ya desplazados.
    const t2 = [{ puntos: fijos.slice(0, 10) }, { puntos: fijos.slice(30).map((v, i) => [v[0], v[1], at(60 + i), v[3]] as Vertice) }]
    const dia: RecorridoHoy = { user_id: 1, fecha: DIA, desde: at(0), hasta: at(90), telefono: null, tramos: tramosDesplazados(t2, 16, CARRIL_PX), paradas: [], huecos: [{ desde: fijos[9][2], hasta: at(60), segundos: 3000 }], resumen: { distancia_m: 0, puntos: 0, paradas: 0 }, server_time: at(90) }
    const [hueco] = gapLinks(dia)
    expect(hueco.from).toEqual([dia.tramos[0].puntos[9][0], dia.tramos[0].puntos[9][1]])
    expect(hueco.to).toEqual([dia.tramos[1].puntos[0][0], dia.tramos[1].puntos[0][1]])
  })
})
