import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from '@/shared/stores'
import { getDateTime2 } from '@/shared/utils'
import { useAgendaAccess } from '@/features/security-agenda/composables/useAgendaAccess'
import { useManagerAgendaStatus } from '@/features/security-agenda/composables/useManagerAgendaStatus'
import { AGENDA_RELEASED } from '@/features/security-agenda/constants'
import { ROUTE_NAME } from '@/router'

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
  Calendar,
  CalendarCheck,
  CalendarSearch,
  Banknote,
} from 'lucide-vue-next'
import { hasCashReportPermission } from '@/features/cash-report/cash-report.constants'

/**
 * Tipos para el menú
 */
export interface MenuItem {
  id: string
  title: string
  icon: any
  route?: string
  /** Parámetros de la ruta, cuando la vista depende de algo del Home (la gerencia). */
  params?: Record<string, string>
  href?: string
  disabled?: boolean
  description?: string
  /** Tile presente pero sin nada que ver hoy: se pinta en gris. */
  muted?: boolean
  /** Punto de estado sobre el icono; `label` lo dice para el lector de pantalla. */
  mark?: { class: string; label: string } | null
}

/**
 * Composable para manejar la lógica del menú principal
 * @returns Objeto con estado y métodos del menú
 */
export function useHomeMenu() {
  const router = useRouter()
  const $store = useStore()
  const { canUseAgenda } = useAgendaAccess()
  const managerAgenda = useManagerAgendaStatus()

  // Drawer states
  const isAgencyDrawerOpen = ref(false)
  const isGeneralDrawerOpen = ref(false)

  // Store computed properties
  const agency = computed(() => $store.agencySelected)
  /** Los FABs de agencia se esperan a que termine de cargar, como siempre. */
  const isLoading = computed(() => $store.loading)
  const management = computed(() => $store.gerenciaSelected)
  const isManagerUser = computed(() => $store.user?.tipo === 'Gerente')
  const isRegionalUser = computed(() => $store.user?.tipo === 'Regional')
  const currentWeek = computed(() => $store.currentDate.week)
  const formattedCurrentDate = computed(() => getDateTime2())
  
  const isDevelopmentEnvironment = computed(() => {
    const hostname = window.location.hostname
    return (
      import.meta.env.VITE_ENVIRONMENT === 'dev' ||
      hostname === 'localhost' ||
      hostname.includes('127.0.0.1') ||
      hostname.includes('pgs-dev.terio.dev')
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
      id: 'reporte-efectivo',
      title: 'Efectivo general',
      icon: Banknote,
      route: ROUTE_NAME.CASH_REPORT,
      disabled: !hasCashReportPermission($store.user),
      description: 'Por sucursal'
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
      // Espejo de la tarjeta del Home: misma vista, misma condición de acceso.
      id: 'agenda-seguridad',
      title: 'Mi agenda',
      icon: CalendarCheck,
      route: ROUTE_NAME.SECURITY_AGENDA,
      // El permiso se conserva junto a la autorizacion pendiente: cuando la
      // agenda se publique, la tarjeta vuelve a depender solo de quien mira.
      disabled: !AGENDA_RELEASED || !canUseAgenda.value,
      description: 'Agenda del día'
    },
    {
      // Agenda del gerente de la gerencia seleccionada, sólo lectura. Sigue a la
      // gerencia como el tile "Gerencia"; vacante o sin agenda hoy queda en gris.
      id: 'agenda-gerente',
      title: 'Agenda gerente',
      icon: CalendarSearch,
      route: ROUTE_NAME.SECURITY_AGENDA_MANAGER,
      params: management.value ? { gerencia: management.value } : undefined,
      disabled: !AGENDA_RELEASED || !managerAgenda.canViewManagerAgenda.value,
      description: managerAgenda.withoutAgenda.value ? 'Sin agenda hoy' : management.value,
      muted: managerAgenda.withoutAgenda.value,
      mark: managerAgenda.mark.value
    },
    {
      id: 'calendar',
      title: 'Calendario',
      icon: Calendar,
      route: ROUTE_NAME.CALENDAR,
      description: 'Ver calendario',
    },
    {
      id: 'pagare',
      title: 'Pagarés',
      icon: Book,
      route: ROUTE_NAME.PROMISSORY_NOTES,
      description: 'Entregar pagarés'
    },
    {
      id: 'solim',
      title: 'Solicitudes app',
      icon: FileCheck,
      route: ROUTE_NAME.ADMIN_SOLIM,
      description: 'Revisar solicitudes'
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
   * Abre el drawer de acciones de agencia
   */
  const openAgencyActions = () => {
    isAgencyDrawerOpen.value = true
  }

  /**
   * Abre el drawer de acciones generales
   */
  const openGeneralActions = () => {
    isGeneralDrawerOpen.value = true
  }

  /**
   * Cierra el drawer de acciones de agencia
   */
  const closeAgencyActions = () => {
    isAgencyDrawerOpen.value = false
  }

  /**
   * Cierra el drawer de acciones generales
   */
  const closeGeneralActions = () => {
    isGeneralDrawerOpen.value = false
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
        router.push({ name: item.route, params: item.params })
      }
    }
  }

  return {
    // Estado reactivo
    agency,
    isLoading,
    currentWeek,
    formattedCurrentDate,
    agencyMenuItems,
    generalMenuItems,

    // Drawer states
    isAgencyDrawerOpen,
    isGeneralDrawerOpen,

    // Métodos de drawer
    openAgencyActions,
    openGeneralActions,
    closeAgencyActions,
    closeGeneralActions,

    // Métodos de navegación
    handleMenuItemClick
  }
} 
