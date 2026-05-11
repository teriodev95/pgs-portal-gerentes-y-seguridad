<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import { ROUTE_NAME } from '@/router'
import { User, Phone, Shield } from 'lucide-vue-next'
import { personalInfoService } from '../services/personal-info.service'
import type { UserContactInfo } from '../types'

// Components
import NavbarCT from '@/shared/components/ui/NavbarCT.vue'
import MainCT from '@/shared/components/ui/MainCT.vue'
import UserInfoItem from '../components/UserInfoItem.vue'
import LoadSkeleton from '@/shared/components/LoadSkeleton.vue'

const router = useRouter()
const store = useStore()

// State
const contactInfo = ref<UserContactInfo | null>(null)
const isLoading = ref(false)

// Computed properties
const user = computed(() => store.user)
const userType = computed(() => user.value?.tipo || 'Usuario')

// Computed from API data (with fallback to store)
// Solo el nombre (para el header)
const firstName = computed(() => {
  if (contactInfo.value?.nombreCompleto) {
    // Extraer solo el primer nombre del nombreCompleto
    const nombres = contactInfo.value.nombreCompleto.trim().split(' ')
    return nombres[0] || 'Usuario'
  }
  return user.value?.nombre || 'Usuario'
})

// Nombre completo (para la card de información)
const fullName = computed(() => {
  if (contactInfo.value?.nombreCompleto) {
    return contactInfo.value.nombreCompleto.trim()
  }
  if (!user.value) return 'No registrado'
  const { nombre, apellidoPaterno, apellidoMaterno } = user.value
  return `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim()
})

const phoneNumber = computed(() => {
  if (contactInfo.value?.numeroCelular) {
    return contactInfo.value.numeroCelular
  }
  return user.value?.numeroCelular || 'No registrado'
})

// Methods
async function fetchContactInfo(): Promise<void> {
  if (!user.value?.usuario) return

  isLoading.value = true
  try {
    const response = await personalInfoService.getUserContactInfo(user.value.usuario)
    contactInfo.value = response.data
  } catch (error) {
    console.error('Error fetching contact info:', error)
    // Keep using store data as fallback
  } finally {
    isLoading.value = false
  }
}

function handleBack(): void {
  router.push({ name: ROUTE_NAME.DASHBOARD_HOME })
}

// Lifecycle
onMounted(() => {
  fetchContactInfo()
})
</script>

<template>
  <MainCT>
    <!-- Top Navigation Bar -->
    <NavbarCT
      title="Datos Personales"
      :show-back-button="true"
      @back="handleBack"
    />

    <!-- User Profile Header -->
    <div class="border-b border-slate-200 bg-white px-4 py-6">
      <div class="flex items-center gap-4">
        <!-- Avatar Icon -->
        <div class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600">
          <User class="h-8 w-8" stroke-width="2" />
        </div>

        <!-- User Info -->
        <div class="flex-1">
          <h1 class="text-xl font-bold text-slate-900">{{ firstName }}</h1>
          <div class="mt-1 flex items-center gap-2">
            <Shield class="h-4 w-4 text-slate-500" stroke-width="2.5" />
            <p class="text-sm font-medium text-slate-600">{{ userType }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Personal Information Content -->
    <div class="space-y-4 px-4 py-6">
      <!-- Section Header -->
      <div class="mb-5">
        <h2 class="text-base font-bold text-slate-800">Información de Contacto</h2>
        <p class="mt-1 text-sm text-slate-500">
          Verifica que tus datos estén actualizados
        </p>
      </div>

      <!-- Loading State -->
      <LoadSkeleton v-if="isLoading" :items="2" class="space-y-3" />

      <!-- Info Cards -->
      <div v-else class="space-y-3">
        <!-- Full Name -->
        <UserInfoItem
          label="Nombre completo"
          :value="fullName"
          :icon="User"
        />

        <!-- Phone Number -->
        <UserInfoItem
          label="Número de teléfono"
          :value="phoneNumber"
          :icon="Phone"
        />
      </div>
    </div>
  </MainCT>
</template>
