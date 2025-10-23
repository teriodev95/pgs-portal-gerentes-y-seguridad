export const TIMER_CONFIG = {
  WARNING_THRESHOLD_MINUTES: 2,
  ALERT_THRESHOLD_MINUTES: 1,
  DEFAULT_DURATION_SECONDS: 600, // 10 minutos
  UPDATE_INTERVAL_MS: 1000
} as const

export const TIMER_COLORS = {
  INFO: 'green',
  WARNING: 'orange',
  ALERT: 'red'
} as const