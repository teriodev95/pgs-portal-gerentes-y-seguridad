<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from '@/shared/stores'
import { toCurrency } from '@/shared/utils'
import {
  etiquetaMes,
  formatoRango,
  parseRemanenteAdelanto,
  rangoSemana,
  TIPOS_NO_MONETARIOS
} from '../helpers'
import type { IPayment } from '../types'
import PaymentCard from './PaymentCard.vue'
import TextCT from '@/shared/components/ui/TextCT.vue'
import BtnComponent from '@/shared/components/BtnComponent.vue'
import ArrowDown from '@/shared/components/icons/ArrowDown.vue'
import CalendarIcon from '@/shared/components/icons/CalendarIcon.vue'

// Acordeón propio agrupado POR SEMANA: la tarifa es una vara semanal, así que
// la historia (¿la semana quedó cubierta?) vive aquí — un punto de color
// sutil por fila — y no en cada pago individual (con 2 pagos en la misma
// semana, compararlos por separado contra la tarifa mentiría).
interface Props {
  historialList: IPayment[]
}

interface Emits {
  (e: 'verDetalles', payment: IPayment): void
  (e: 'adelantar', payment: IPayment): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const $store = useStore()

type Cobertura = 'completa' | 'parcial' | 'sin-pago'

interface SemanaGroup {
  key: string
  anio: number
  semana: number
  pagos: IPayment[]
  total: number
  cobertura: Cobertura
  adelantada: boolean
  remanenteSiguiente: number | null
  rango: string
  mes: string
}

const semanas = computed<SemanaGroup[]>(() => {
  const map = new Map<string, SemanaGroup>()

  for (const pago of props.historialList) {
    const key = `${pago.anio}-${pago.semana}`
    let grupo = map.get(key)
    if (!grupo) {
      grupo = { key, anio: pago.anio, semana: pago.semana, pagos: [], total: 0, cobertura: 'sin-pago', adelantada: false, remanenteSiguiente: null, rango: '', mes: '' }
      map.set(key, grupo)
    }
    grupo.pagos.push(pago)
  }

  for (const grupo of map.values()) {
    const monetarios = grupo.pagos.filter((p) => !TIPOS_NO_MONETARIOS.includes(p.tipo))
    grupo.total = monetarios.reduce((suma, p) => suma + p.monto, 0)

    const tarifa = grupo.pagos[0]?.tarifa ?? 0
    const liquidacion = grupo.pagos.some((p) => p.tipo === 'Liquidacion')
    grupo.adelantada = grupo.pagos.some((p) => p.tipo === 'Adelantado')

    // El último marcador de un adelanto puede dejar un abono para la semana
    // que sigue (etiqueta [remanente=] del marcador)
    const marcador = grupo.pagos.find((p) => p.tipo === 'Adelantado')
    grupo.remanenteSiguiente = parseRemanenteAdelanto(marcador)?.remanente ?? null

    // Identidad calendárica: rango mié–mar y mes, derivados de la fecha de
    // cualquier pago de la semana (los marcadores traen el miércoles)
    const rango = rangoSemana(grupo.pagos[0]?.fechaPago ?? '')
    grupo.rango = rango ? formatoRango(rango) : `Semana ${grupo.semana} / ${grupo.anio}`
    grupo.mes = rango ? etiquetaMes(rango) : String(grupo.anio)

    if (grupo.adelantada || liquidacion || (tarifa > 0 && grupo.total >= tarifa)) {
      grupo.cobertura = 'completa'
    } else if (grupo.total > 0) {
      grupo.cobertura = 'parcial'
    } else {
      grupo.cobertura = 'sin-pago'
    }
  }

  // Regla de adyacencia (la misma que aplican los triggers y vistas de BD):
  // el remanente que dejó la semana anterior cuenta para la cobertura de esta.
  // Ej.: remanente $137.50 + pago $43.75 = tarifa completa -> verde.
  for (const grupo of map.values()) {
    if (grupo.cobertura === 'completa') continue
    const anterior = map.get(`${grupo.anio}-${grupo.semana - 1}`)
    const remanente = anterior?.remanenteSiguiente
    if (!remanente) continue
    const tarifa = grupo.pagos[0]?.tarifa ?? 0
    if (tarifa > 0 && grupo.total + remanente >= tarifa) {
      grupo.cobertura = 'completa'
    } else if (grupo.total + remanente > 0) {
      grupo.cobertura = 'parcial'
    }
  }

  return [...map.values()].sort((a, b) => {
    if (a.anio !== b.anio) return b.anio - a.anio
    return b.semana - a.semana
  })
})

// El adelanto es una propiedad de la SEMANA (el SP mide el agregado semanal,
// llegue en 1 o N pagos), por eso su affordance vive aquí y no en cada pago.
// Pre-filtro de visibilidad; la autoridad es el preview del SP.
function puedeAdelantarGrupo(grupo: SemanaGroup): boolean {
  const tarifa = grupo.pagos[0]?.tarifa ?? 0
  if (tarifa <= 0) return false
  if (grupo.adelantada) return false
  if (grupo.pagos.some((p) => p.tipo === 'Liquidacion')) return false
  if (grupo.pagos.some((p) => p.comentario?.includes('ADELANTO:'))) return false
  if (grupo.total - tarifa < tarifa) return false
  const { week, year } = $store.currentDate
  const esActual = grupo.anio === year && grupo.semana === week
  const esAnterior = grupo.anio === year && grupo.semana === week - 1
  return esActual || esAnterior
}

function semanasQueCubriria(grupo: SemanaGroup): number {
  const tarifa = grupo.pagos[0]?.tarifa ?? 0
  if (tarifa <= 0) return 0
  return Math.floor((grupo.total - tarifa) / tarifa)
}

function pagoAncla(grupo: SemanaGroup): IPayment | null {
  return grupo.pagos.find((p) => !TIPOS_NO_MONETARIOS.includes(p.tipo)) ?? null
}

function handleAdelantar(grupo: SemanaGroup) {
  const ancla = pagoAncla(grupo)
  if (ancla) emit('adelantar', ancla)
}

// Estado de la semana en palabras — la norma en silencio, la excepción con
// voz: las semanas cumplidas van en gris con un punto verde mínimo (si todo
// está bien, la lista se ve serena); solo las desviaciones llevan color.
interface EstadoSemana {
  texto: string
  clase: string
  punto?: string
}

function estadoSemana(grupo: SemanaGroup): EstadoSemana {
  if (grupo.adelantada) {
    return { texto: 'Cubierta por adelanto', clase: 'text-teal-700 font-medium' }
  }
  if (grupo.pagos.some((p) => p.tipo === 'Liquidacion')) {
    return { texto: 'Liquidó', clase: 'text-purple-700 font-medium' }
  }
  const tarifa = grupo.pagos[0]?.tarifa ?? 0
  if (grupo.cobertura === 'completa') {
    return {
      texto: grupo.total > tarifa ? 'Pagada con excedente' : 'Pagada',
      clase: 'font-light text-gray-400',
      punto: 'bg-green-500'
    }
  }
  if (grupo.cobertura === 'parcial') {
    return { texto: 'Pago parcial', clase: 'text-amber-600 font-medium' }
  }
  return { texto: 'Sin pago', clase: 'text-red-500 font-medium' }
}

// Separadores de mes: la lista se lee como calendario; el año vive aquí,
// una sola vez por bloque
const semanasConMes = computed(() =>
  semanas.value.map((grupo, i) => ({
    grupo,
    nuevoMes: i === 0 || grupo.mes !== semanas.value[i - 1].mes
  }))
)

const openKey = ref<string | null>(null)

function toggle(key: string) {
  openKey.value = openKey.value === key ? null : key
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border bg-white">
    <template v-for="item in semanasConMes" :key="item.grupo.key">
      <!-- Separador de mes: el año vive aquí, una sola vez por bloque -->
      <div
        v-if="item.nuevoMes"
        class="border-b border-gray-100 bg-gray-50/80 px-4 pb-1.5 pt-2.5 text-[11px] font-semibold tracking-wider text-gray-400"
      >
        {{ item.grupo.mes }}
      </div>

      <div class="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50"
        @click="toggle(item.grupo.key)"
      >
        <!-- Tile de semana: ancla visual escaneable (patrón calendario) -->
        <span class="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50">
          <span class="text-sm font-bold leading-none text-blue-800">{{ item.grupo.semana }}</span>
          <span class="mt-0.5 text-[9px] font-medium uppercase leading-none text-blue-400">sem</span>
        </span>

        <span class="flex min-w-0 flex-1 flex-col">
          <!-- Título = cuándo (identidad calendárica) -->
          <span class="text-sm font-semibold text-gray-800">{{ item.grupo.rango }}</span>
          <!-- Subtítulo = cómo se portó (norma en gris + punto; excepción en color) -->
          <span class="inline-flex items-center gap-1.5 text-xs">
            <span
              v-if="estadoSemana(item.grupo).punto"
              class="h-1.5 w-1.5 shrink-0 rounded-full"
              :class="estadoSemana(item.grupo).punto"
            ></span>
            <span :class="estadoSemana(item.grupo).clase">{{ estadoSemana(item.grupo).texto }}</span>
            <span v-if="item.grupo.pagos.length > 1" class="font-light text-gray-400">
              · {{ item.grupo.pagos.length }} pagos
            </span>
          </span>
          <span v-if="item.grupo.remanenteSiguiente" class="text-xs font-medium text-teal-700">
            dejó {{ toCurrency(item.grupo.remanenteSiguiente) }} abonados a la siguiente semana
          </span>
        </span>

        <span class="flex shrink-0 items-center gap-3">
          <!-- Monto solo cuando entró dinero; el estado ya explica los $0 -->
          <TextCT v-if="item.grupo.total > 0" variant="secondary">{{ toCurrency(item.grupo.total) }}</TextCT>
          <ArrowDown
            class="size-4 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': openKey === item.grupo.key }"
          />
        </span>
      </button>

      <!-- Nivel 2: los pagos viven en una tarjeta inset — contención visual
           clara de "esto está DENTRO de la semana" -->
      <div v-if="openKey === item.grupo.key" class="space-y-3 border-t border-gray-100 bg-gray-50/70 px-4 py-3">
        <!-- Adelantar: acción de la SEMANA (cubre el caso de tarifa en varios
             pagos), el porqué junto al qué -->
        <div
          v-if="puedeAdelantarGrupo(item.grupo)"
          class="space-y-3 rounded-lg border border-blue-200 bg-blue-50/70 p-3"
        >
          <p class="text-sm leading-snug text-blue-900">
            <b>{{ item.grupo.pagos.length > 1 ? 'Los pagos de esta semana cubren más de una tarifa del cliente.' : 'Este pago cubre más de una tarifa del cliente.' }}</b>
            Con el sobrante puedes dejar
            {{ semanasQueCubriria(item.grupo) === 1 ? 'pagada por adelantado la siguiente semana' : `pagadas por adelantado las siguientes ${semanasQueCubriria(item.grupo)} semanas` }}.
          </p>
          <BtnComponent variant="primary" full-width size="sm" @click="handleAdelantar(item.grupo)">
            <template #icon-left>
              <CalendarIcon class="size-4" />
            </template>
            Adelantar semanas
          </BtnComponent>
        </div>

        <div class="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <PaymentCard
            v-for="pago in item.grupo.pagos"
            :key="pago.pagoId"
            :payment="pago"
            @ver-detalles="emit('verDetalles', $event)"
          />
        </div>
      </div>
      </div>
    </template>
  </div>
</template>
