// Paradas que comparten lugar: la seleccionada siempre se dibuja (bug del 29-oct, usuario 91: la 2 de 18 min quedaba
// tapada por la 18 de 32 min en el mismo sitio) y el navegador lo dice: «mismo lugar que la 18».
import { describe, expect, it } from 'bun:test'
import { notaMismoLugar, paradasCoincidentes, paradasVisibles } from '../equipo-gps.helpers'
import type { RecorridoHoy } from '../equipo-gps.types'

const parada = (lat: number, lon: number, inicio: string, min: number): RecorridoHoy['paradas'][number] => ({
  lat, lon, inicio: `2026-10-29T${inicio}:00-06:00`, fin: `2026-10-29T${inicio}:00-06:00`, segundos: min * 60
})
// 18 paradas: la 2 (índice 1) y la 18 (índice 17) a ~20 m; la 5 (índice 4) a ~60 m de ellas; el resto lejos.
const paradas = Array.from({ length: 18 }, (_, i) => parada(19.3 + i * 0.01, -98.5 + i * 0.01, '10:00', 10))
paradas[1] = parada(19.49333, -98.53499, '08:20', 18)
paradas[17] = parada(19.49348, -98.53489, '17:09', 32)
paradas[4] = parada(19.49387, -98.53499, '11:00', 5)

describe('Paradas encimadas', () => {
  it('sin selección, de dos en el mismo lugar sólo se dibuja la más larga', () => {
    const visibles = paradasVisibles(paradas, 16)
    expect(visibles).toContain(17)
    expect(visibles).not.toContain(1)
  })
  it('la seleccionada se dibuja siempre aunque sea la más corta y la tape otra', () => {
    for (const zoom of [13, 15, 16, 17]) {
      const visibles = paradasVisibles(paradas, zoom, 18, 1)
      expect(visibles).toContain(1)
      expect(visibles).toContain(17)
      expect(visibles).toEqual([...visibles].sort((a, b) => a - b))
    }
    // Una selección fuera de rango no agrega nada.
    expect(paradasVisibles(paradas, 16, 18, 99)).toEqual(paradasVisibles(paradas, 16))
  })
  it('coincidentes: a menos de 40 m siempre; a menos de 18 px sólo con zoom de calle', () => {
    expect(paradasCoincidentes(paradas, 1, 17)).toEqual([17])
    expect(paradasCoincidentes(paradas, 17, 17)).toEqual([1])
    // A zoom 15 (≈4.5 m por píxel) la 5, a 60 m, también se encima en pantalla.
    expect(paradasCoincidentes(paradas, 1, 15)).toEqual([4, 17])
    // Lejos del zoom de calle encimarse es cosa de la escala: sólo cuenta el lugar (40 m).
    expect(paradasCoincidentes(paradas, 1, 9)).toEqual([17])
    expect(paradasCoincidentes(paradas, 9, 17)).toEqual([])
  })
  it('la nota del navegador lista las paradas con su número', () => {
    expect(notaMismoLugar([])).toBe('')
    expect(notaMismoLugar([17])).toBe('mismo lugar que la 18')
    expect(notaMismoLugar([4, 17])).toBe('mismo lugar que la 5 y la 18')
    expect(notaMismoLugar([2, 4, 17])).toBe('mismo lugar que la 3, la 5 y la 18')
  })
})
