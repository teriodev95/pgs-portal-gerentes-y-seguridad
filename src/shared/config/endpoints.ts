const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const envUrl = (key: string, fallback: string) => {
  const value = import.meta.env[key]
  return stripTrailingSlash(typeof value === 'string' && value.length > 0 ? value : fallback)
}

export const XPRESS_ENDPOINTS = {
  faxApi: `${envUrl('VITE_FAX_API_URL', 'https://fax-prod.xpress1.cc')}/api`,
  javalinApi: envUrl('VITE_JAVALIN_API_URL', 'https://javalin.xpress1.cc/api'),
  elysiaApi: envUrl('VITE_ELYSIA_API_URL', 'https://elysia.xpress1.cc/api'),
  mcpApi: envUrl('VITE_MCP_API_URL', 'https://mcp.xpress1.cc'),
  reportesApi: envUrl('VITE_IMG_REPORTES_API_URL', 'https://img-reporte.xpress1.cc/api/reportes'),
  moxUrl: envUrl('VITE_MOX_URL', 'https://mox-ii.xpress1.cc'),
  commissionUrl: envUrl('VITE_COMMISSION_URL', 'https://comi.xpress1.cc'),
  loanSimulatorUrl: envUrl('VITE_LOAN_SIMULATOR_URL', 'https://cierres.xpress1.cc/simulador-credito'),
  ticketsUrl: envUrl('VITE_TICKETS_URL', 'https://tfd.xpress1.cc/mis-tickets'),
} as const
