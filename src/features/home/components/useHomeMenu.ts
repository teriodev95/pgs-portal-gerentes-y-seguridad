import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import { getDateTime2 } from '@/shared/utils'
import { ROUTE_NAME } from '@/router'
import { useMultipleBottomSheets } from '@/shared/composables/useBottomSheet'

// Lucide Icons
import {
  Settings,
  Calculator,
  Phone,
  TrendingUp,
  FileText,
  AlertTriangle,
  XCircle,
  UserCheck,
  Receipt,
  ShoppingCart,
  FileCheck,
  MapPin,
  Building,
  CreditCard,
  X,
  Users,
  Ticket,
  CalculatorIcon,
  KeyRound,
  Share,
  Book,
  Calendar
} from 'lucide-vue-next'

/**
 * Tipos para el menú
 */
export interface MenuItem {
  id: string
  title: string
  icon: any
  route?: string
  href?: string
  disabled?: boolean
  description?: string
}

/**
 * Composable para manejar la lógica del menú principal
 * @returns Objeto con estado y métodos del menú
 */
export function useHomeMenu() {
  const router = useRouter()
  const $store = useStore()

  // Inicializar bottom sheets
  const { 
    registerBottomSheet, 
    openBottomSheet, 
    closeBottomSheet 
  } = useMultipleBottomSheets(['agency', 'general'])

  // Store computed properties
  const agency = computed(() => $store.agencySelected)
  const management = computed(() => $store.gerenciaSelected)
  const isManagerUser = computed(() => $store.user?.tipo === 'Gerente')
  const isRegionalUser = computed(() => $store.user?.tipo === 'Regional')
  const currentWeek = computed(() => $store.currentDate.week)
  const isAgencyUsingApp = computed(() => $store.isAgencyUsingApp)
  const formattedCurrentDate = computed(() => getDateTime2())
  
  const isDevelopmentEnvironment = computed(() => {
    const hostname = window.location.hostname
    return (
      import.meta.env.VITE_ENVIRONMENT === 'dev' ||
      hostname === 'localhost' ||
      hostname.includes('127.0.0.1') ||
      hostname.includes('pgs-dev.terio.xyz')
    )
  })

  const weeklyCloseRouteName = computed(() => {
    // En desarrollo siempre ir a WEEKLY_CLOSE
    if (isDevelopmentEnvironment.value) {
      return ROUTE_NAME.WEEKLY_CLOSE
    }
    
    // En producción respetar la regla original
    return $store.hasCobranzasWithCrtp
      ? ROUTE_NAME.WEEKLY_CLOSE_ERROR
      : ROUTE_NAME.WEEKLY_CLOSE
  })

  // Menu Items Configuration
  const agencyMenuItems = computed<MenuItem[]>(() => [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Building,
      route: ROUTE_NAME.DASHBOARD_AGENCY,
      description: agency.value
    },
    {
      id: 'payments',
      title: 'Pagos',
      icon: CreditCard,
      route: ROUTE_NAME.LOAN_PAYMENT,
      disabled: !isAgencyUsingApp.value,
      description: 'Registrar pagos'
    },
    {
      id: 'weekly-close',
      title: 'Cierre',
      icon: X,
      route: weeklyCloseRouteName.value,
      description: 'Generar cierre'
    },
    {
      id: 'assignments',
      title: 'Asignaciones',
      icon: Users,
      route: ROUTE_NAME.ASSIGNMENTS,
      description: 'Ver asignaciones'
    }
  ])

  const generalMenuItems = computed<MenuItem[]>(() => [
    {
      id: 'gerencia',
      title: 'Gerencia',
      icon: Settings,
      route: ROUTE_NAME.DASHBOARD_GERENCY,
      description: management.value
    },
    {
      id: 'tabulador',
      title: 'Tabulador',
      icon: Calculator,
      route: ROUTE_NAME.MONEY_TABULATION,
      description: 'Contar dinero'
    },
    {
      id: 'flujo',
      title: 'Flujo',
      icon: TrendingUp,
      route: ROUTE_NAME.DASHBOARD_CASH_FLOW,
      description: 'Efectivo'
    },
    {
      id: 'detalles',
      title: 'Detalles',
      icon: FileText,
      route: ROUTE_NAME.WEEKLY_CLOSE_DETAILS,
      description: 'Del cierre'
    },
    {
      id: 'incidentes',
      title: 'Incidentes',
      icon: AlertTriangle,
      route: ROUTE_NAME.DASHBOARD_INCIDENTS,
      description: 'Nómina'
    },
    {
      id: 'asignaciones',
      title: 'Asignaciones',
      icon: UserCheck,
      route: ROUTE_NAME.MANAGER_ASSIGNMENTS_VIEW,
      description: 'Crear y ver'
    },
    {
      id: 'gastos',
      title: 'Gastos',
      icon: Receipt,
      route: ROUTE_NAME.WEEKLY_EXPENSES,
      description: 'Registrar gastos'
    },
    {
      id: 'ventas',
      title: 'Ventas',
      icon: ShoppingCart,
      route: ROUTE_NAME.SALES,
      description: 'Registrar ventas'
    },
    {
      id: 'simulador',
      title: 'Simulador',
      icon: CalculatorIcon,
      route: ROUTE_NAME.LOAN_SIMULATION,
      description: 'Ver simulador de créditos'
    },
    {
      id: 'mapa',
      title: 'Mapa',
      icon: MapPin,
      route: ROUTE_NAME.MAP_PAYMENTS,
      description: 'Ver mapa'
    },
    {
      id: 'ticket',
      title: 'Tickets',
      icon: Ticket,
      route: ROUTE_NAME.TICKETS,
      description: 'Soporte'
    },
    {
      id: 'daily-report',
      title: 'Reporte Diario',
      route: ROUTE_NAME.DAILY_REPORT ,
      icon: Share,
      description: 'Compartir vía Whatsapp'
    },
    {
      id: 'special-settlement',
      title: 'Liquidación Especial',
      route: ROUTE_NAME.SPECIAL_SETTLEMENT ,
      icon: Book,
    },
    {
      id: 'calendar',
      title: 'Calendario',
      icon: Calendar,
      route: ROUTE_NAME.CALENDAR,
      description: 'Ver calendario',
    },
    {
      id: 'solim',
      title: 'Admin Solim',
      icon: FileCheck,
      route: ROUTE_NAME.ADMIN_SOLIM,
      disabled: isRegionalUser.value,
      description: 'Administrar solicitudes'
    },
    {
      id: 'no-pagos',
      title: 'No pagos',
      icon: XCircle,
      route: ROUTE_NAME.NO_PAYMENTS,
      disabled: isManagerUser.value || isRegionalUser.value,
      description: 'Ver no pagos'
    },
    {
      id: 'reportes',
      title: 'Reportes',
      icon: Phone,
      route: ROUTE_NAME.CALL_CENTER_REPORTS,
      disabled: isManagerUser.value || isRegionalUser.value,
      description: 'Call Center'
    },
    {
      id: 'pin-seguridad',
      title: 'Pin de Seguridad',
      icon: KeyRound,
      route: ROUTE_NAME.SECURITY_PIN,
      disabled: isManagerUser.value || isRegionalUser.value,
      description: 'Compartir pin',
    },
  ])

  /**
   * Abre el bottom sheet de acciones de agencia
   */
  const openAgencyActions = () => {
    openBottomSheet('agency')
  }

  /**
   * Abre el bottom sheet de acciones generales
   */
  const openGeneralActions = () => {
    openBottomSheet('general')
  }

  /**
   * Cierra el bottom sheet de acciones de agencia
   */
  const closeAgencyActions = () => {
    closeBottomSheet('agency')
  }

  /**
   * Cierra el bottom sheet de acciones generales
   */
  const closeGeneralActions = () => {
    closeBottomSheet('general')
  }

  /**
   * Maneja el clic en un item del menú
   * @param item Item del menú seleccionado
   * @param closeSheet Función para cerrar el bottom sheet
   */
  const handleMenuItemClick = async (item: MenuItem, closeSheet: () => void) => {

    if (item.disabled) return
    
    closeSheet()

    if (item.href) {
      window.open(item.href, '_blank')
    } else if (item.route) {
      if (item.route === ROUTE_NAME.ASSIGNMENTS) {
        router.push({ name: item.route, query: { from: 'home' } })
      } else {
        router.push({ name: item.route })
      }
    }
  }

  return {
    // Estado reactivo
    agency,
    currentWeek,
    formattedCurrentDate,
    agencyMenuItems,
    generalMenuItems,
    
    // Métodos de bottom sheet
    registerBottomSheet,
    openAgencyActions,
    openGeneralActions,
    closeAgencyActions,
    closeGeneralActions,
    
    // Métodos de navegación
    handleMenuItemClick
  }
} 