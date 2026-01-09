import { AuthGuard } from './guard'
import { createRouter, createWebHistory } from 'vue-router'
import { ROUTE_NAME } from './names'
// Pages
import AgencyDetailsView from '@/features/entity/views/AgencyDetailsView.vue'
import AssignmentsView from '@/features/assignment/views/AssignmentsView.vue'
import AuthLayout from '@/shared/components/layouts/AuthLayout.vue'
import AuthLogin from '@/features/auth/views/AuthLogin.vue'
import AuthPin from '@/features/auth/views/AuthPin.vue'
import DashboardLayout from '@/shared/components/layouts/DashboardLayout.vue'
import GerencyDetails from '@/features/entity/views/GerencyDetails.vue'
import HistorialView from '@/features/payment-details/views/PaymentHistoryView.vue'
import HomeView from '@/features/home/views/HomeView.vue'
import LoanView from '@/features/loan/views/LoanView.vue'
import WeeklyClose from '@/features/weekly-close/views/WeeklyClose.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DashboardLayout,
      beforeEnter: AuthGuard,
      children: [
        {
          path: '',
          name: ROUTE_NAME.DASHBOARD_HOME,
          component: HomeView
        },
        {
          path: 'agency',
          children: [
            {
              path: '',
              name: ROUTE_NAME.DASHBOARD_AGENCY,
              component: AgencyDetailsView
            },
            {
              path: 'cierre',
              name: ROUTE_NAME.WEEKLY_CLOSE,
              component: WeeklyClose
            },
            {
              path: 'cierre-error',
              name: ROUTE_NAME.WEEKLY_CLOSE_ERROR,
              component: () => import('@/features/weekly-close/views/WeeklyClosureError.vue')
            },
            {
              path: 'cierre-detalles',
              name: ROUTE_NAME.WEEKLY_CLOSE_DETAILS,
              component: () => import('@/features/weekly-details/views/WeeklyDetailsView.vue')
            },
          ]
        },
        {
          path: 'gerencia',
          name: ROUTE_NAME.DASHBOARD_GERENCY,
          component: GerencyDetails
        },
        {
          path: 'assignments',
          name: ROUTE_NAME.ASSIGNMENTS,
          component: AssignmentsView
        },
        {
          path: 'assignment-manager',
          children: [
            {
              path: '',
              name: ROUTE_NAME.MANAGER_ASSIGNMENTS_VIEW,
              component: () => import('@/features/assignment/views/ManagerAssignmentsView.vue'),
            },
            {
              path: 'create',
              name: ROUTE_NAME.MANAGER_ASSIGNMENTS_VIEW_CREATE,
              component: () => import('@/features/assignment/views/AssignmentsCreateView.vue'),
            }
          ]
        },
        {
          path: 'prestamo',
          name: ROUTE_NAME.DASHBOARD_PRESTAMO,
          component: LoanView,
        },
        {
          path: 'historial',
          name: ROUTE_NAME.DASHBOARD_HISTORIAL_PAGO,
          component: HistorialView
        },
        {
          path: 'map-payments',
          name: ROUTE_NAME.MAP_PAYMENTS,
          component: () => import('@/features/payment-details/views/MapPaymentView.vue')
        },
        {
          path: 'settlements',
          name: ROUTE_NAME.SETTLEMENTS,
          component: () => import('@/features/settlements/views/SettlementsView.vue')
        },
        {
          path: 'special-settlement/:id',
          name: ROUTE_NAME.SPECIAL_SETTLEMENT,
          component: () => import('@/features/settlements/views/SpecialSettlement.vue')
        },
        {
          path: 'no-payments',
          name: ROUTE_NAME.NO_PAYMENTS,
          component: () => import('@/features/no-payment/views/NoPayments.vue')
        },
        {
          path: 'call-center',
          name: ROUTE_NAME.CALL_CENTER_REPORTS,
          component: () => import('@/features/call-center/views/CallCenterReports.vue')
        },
        {
          path: 'weekly-expenses',
          name: ROUTE_NAME.WEEKLY_EXPENSES,
          component: () => import('@/features/expense/views/WeeklyExpensesView.vue')
        },
        {
          path: 'money-tabulator',
          name: ROUTE_NAME.MONEY_TABULATION,
          component: () => import('@/features/tabulator/views/TabulatorView.vue')
        },
        {
          path: 'loan-payment',
          name: ROUTE_NAME.LOAN_PAYMENT,
          component: () => import('@/features/loan/views/LoanPaymentView.vue')
        },
        {
          path: 'sales',
          name: ROUTE_NAME.SALES,
          component: () => import('@/features/sale/views/SalesView.vue')
        },
        {
          path: 'balance',
          name: ROUTE_NAME.BALANCE,
          component: () => import('@/features/balance/views/BalanceView.vue')
        },
        {
          path: 'cash-flow',
          name: ROUTE_NAME.DASHBOARD_CASH_FLOW,
          component: () => import('@/features/iframe/views/CashFlowView.vue')
        },
        {
          path: 'incident',
          name: ROUTE_NAME.DASHBOARD_INCIDENTS,
          component: () => import('@/features/incident/views/IncidentView.vue'),
        },
        {
          path: 'record-correction/:type/:id/:amount',
          name: ROUTE_NAME.RECORD_CORRECTION,
          component: () => import('@/features/correction/views/RecordCorrectionView.vue'),
          props: true
        },
        {
          path: 'commission-details',
          name: ROUTE_NAME.COMMISSIONS_DETAILS,
          component: () => import('@/features/iframe/views/CommissionDetailsView.vue'),
          props: true
        },
        {
          path: 'admin-solim',
          name: ROUTE_NAME.ADMIN_SOLIM,
          component: () => import('@/features/solim/views/AdminSolimView.vue')
        },
        {
          path: 'loan-simulation',
          name: ROUTE_NAME.LOAN_SIMULATION,
          component: () => import('@/features/iframe/views/LoanSimulatorView.vue')
        },
        {
          path: 'security-pin',
          name: ROUTE_NAME.SECURITY_PIN,
          component: () => import('@/features/security-pin/views/SecurityPinView.vue')
        },
        {
          path: 'daily-report',
          name: ROUTE_NAME.DAILY_REPORT,
          component: () => import('@/features/daily-report/views/ReportView.vue')
        },
        {
          path: 'tickets',
          name: ROUTE_NAME.TICKETS,
          component: () => import('@/features/iframe/views/TicketsView.vue')
        },
        {
          path: 'calendar',
          name: ROUTE_NAME.CALENDAR,
          component: () => import('@/features/calendar/views/CalendarView.vue')
        },
        {
          path: 'promissory-notes',
          name: ROUTE_NAME.PROMISSORY_NOTES,
          component: () => import('@/features/promissory-note/views/PromissoryNoteView.vue')
        }

      ]
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: ROUTE_NAME.AUTH_LOGIN,
          component: AuthLogin
        },
        {
          path: 'pin',
          name: ROUTE_NAME.AUTH_PIN,
          component: AuthPin
        }
      ]
    }
  ]
})

export default router

export { ROUTE_NAME }
