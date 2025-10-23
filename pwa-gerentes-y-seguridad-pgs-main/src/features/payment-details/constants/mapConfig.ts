export const MAP_CONFIG = {
  DEFAULT_ZOOM: 12,
  TRANSITION_DELAY: 500,
  MAPBOX_STYLE: 'mapbox://styles/mapbox/streets-v12',
  MAPBOX_STYLE_DARK: 'mapbox://styles/mapbox/dark-v11',
  CONTAINER_ID: 'heat-map'
} as const

export type MapConfigType = keyof typeof MAP_CONFIG