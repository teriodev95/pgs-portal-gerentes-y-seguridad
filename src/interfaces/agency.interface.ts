export interface IAgencyBasicInfo {
  agencia: string
  agente: string
  usaApp: boolean
  /** Sin agente asignado. Lo decide FAX; si no llega, se trata como agencia con agente. */
  vacante?: boolean
}