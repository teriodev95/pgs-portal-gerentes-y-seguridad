<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCheck, RotateCw, WifiOff } from 'lucide-vue-next'
import { ROUTE_NAME } from '@/router/names'
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AvisoCard from '../components/AvisoCard.vue'
import { useAvisos } from '../composables/useAvisos'
import { dayLabel } from '../constants/avisosCopy'
import type { Aviso, AvisosVista } from '../types/avisos.types'

const router = useRouter()
const { noLeidos, vistas, fetchVista, markRead, markAllRead } = useAvisos()

const tab = ref<AvisosVista>('pendientes')
const current = computed(() => vistas[tab.value])
const pendientes = computed(() => vistas.pendientes.avisos)

const historyGroups = computed(() => {
  const groups: { label: string; avisos: Aviso[] }[] = []
  vistas.historial.avisos.forEach((aviso) => {
    const label = dayLabel(aviso.created_at)
    const group = groups[groups.length - 1]
    if (group?.label === label) group.avisos.push(aviso)
    else groups.push({ label, avisos: [aviso] })
  })
  return groups
})

const subtitle = computed(() => (noLeidos.value ? `${noLeidos.value} sin leer` : 'Estás al día'))

// Cada entrada al buzón trae Pendientes al día; Historial se pide al abrir su pestaña.
onMounted(() => {
  vistas.historial.loaded = false
  fetchVista('pendientes')
})

watch(tab, (vista) => {
  if (!vistas[vista].loaded) fetchVista(vista)
})

async function openAviso(aviso: Aviso): Promise<void> {
  await markRead(aviso)
  if (aviso.cta_url) router.push(aviso.cta_url)
}
</script>

<template>
  <MainCT>
    <NavbarCT
      title="Avisos"
      :subtitles="[subtitle]"
      :show-back-button="true"
      @back="router.push({ name: ROUTE_NAME.DASHBOARD_HOME })"
    />

    <Tabs v-model="tab" class="pt-3">
      <div class="flex items-center gap-2 px-4">
        <TabsList class="grid h-auto grid-cols-2 rounded-3xl bg-white p-1 shadow-sm">
          <TabsTrigger value="pendientes" class="rounded-2xl px-3 py-2 text-sm font-semibold">
            Pendientes<span v-if="noLeidos" class="ml-1 text-red-700">{{ noLeidos }}</span>
          </TabsTrigger>
          <TabsTrigger value="historial" class="rounded-2xl px-3 py-2 text-sm font-semibold">Historial</TabsTrigger>
        </TabsList>

        <button
          v-if="tab === 'pendientes' && pendientes.length"
          type="button"
          class="ml-auto rounded-lg px-2 py-2 text-right text-sm font-semibold leading-tight text-blue-700 active:bg-blue-50"
          @click="markAllRead"
        >
          Marcar todo como leído
        </button>
      </div>

      <LoadSkeleton v-if="current.isLoading && !current.avisos.length" :items="4" class="mt-3 px-4" />

      <div v-else-if="current.hasError && !current.avisos.length" class="flex flex-col items-center gap-3 px-8 py-16 text-center">
        <div class="rounded-full bg-gray-100 p-5">
          <WifiOff class="size-10 text-gray-400" />
        </div>
        <p class="text-lg font-semibold text-gray-800">No se pudieron cargar los avisos</p>
        <p class="text-sm text-gray-500">Revisa tu conexión e inténtalo de nuevo.</p>
        <button
          type="button"
          class="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white active:bg-blue-800"
          @click="fetchVista(tab)"
        >
          <RotateCw class="size-4" /> Reintentar
        </button>
      </div>

      <template v-else>
        <TabsContent value="pendientes" class="mt-3">
          <div v-if="pendientes.length" class="border-t border-slate-200">
            <AvisoCard v-for="aviso in pendientes" :key="aviso.id" :aviso="aviso" @open="openAviso" />
            <div v-if="vistas.pendientes.siguiente" class="p-4">
              <button
                type="button"
                class="w-full rounded-full border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 active:bg-slate-100 disabled:opacity-50"
                :disabled="vistas.pendientes.isLoading"
                @click="fetchVista('pendientes', true)"
              >
                {{ vistas.pendientes.isLoading ? 'Cargando…' : 'Cargar más' }}
              </button>
            </div>
          </div>

          <div v-else class="flex flex-col items-center gap-3 px-8 py-16 text-center">
            <div class="rounded-full bg-emerald-50 p-5">
              <CheckCheck class="size-10 text-emerald-600" />
            </div>
            <p class="text-lg font-semibold text-gray-800">Estás al día</p>
            <p class="text-sm text-gray-500">No tienes avisos sin leer.</p>
            <button
              type="button"
              class="mt-1 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 active:bg-blue-50"
              @click="tab = 'historial'"
            >
              Ver historial
            </button>
          </div>
        </TabsContent>

        <TabsContent value="historial" class="mt-3">
          <template v-if="vistas.historial.avisos.length">
            <section v-for="group in historyGroups" :key="group.label">
              <h2 class="border-b border-slate-200 bg-slate-100 px-4 pb-1.5 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {{ group.label }}
              </h2>
              <AvisoCard v-for="aviso in group.avisos" :key="aviso.id" :aviso="aviso" @open="openAviso" />
            </section>

            <div v-if="vistas.historial.siguiente" class="p-4">
              <button
                type="button"
                class="w-full rounded-full border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 active:bg-slate-100 disabled:opacity-50"
                :disabled="vistas.historial.isLoading"
                @click="fetchVista('historial', true)"
              >
                {{ vistas.historial.isLoading ? 'Cargando…' : 'Cargar más' }}
              </button>
            </div>
            <p v-else class="px-4 py-6 text-center text-xs text-slate-400">Se muestran los últimos 30 días</p>
          </template>

          <p v-else class="px-8 py-16 text-center text-sm text-gray-500">Aún no hay avisos leídos en los últimos 30 días.</p>
        </TabsContent>
      </template>
    </Tabs>
  </MainCT>
</template>
