import mapboxgl, { type LngLatLike } from 'mapbox-gl'

export type HeatParams = GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>

export function useMapbox() {
  mapboxgl.accessToken =
    import.meta.env.VITE_MAPBOX_KEY ??
    'pk.eyJ1IjoiZWxldXRlcmlveHoiLCJhIjoiY2o4eDNyOXFsMXV0ZDJxbWJubm5wOWpnMyJ9.OoztAVe4QO5uP4tjtLhOlw'

  return {
    /**
     * initMap
     * @param params
     */
    initMap(params: InitMap) {
      const { center, container, style, zoom } = params
      const map = new mapboxgl.Map({
        container,
        style,
        center,
        zoom
      })

      return map
    },
    /**
     * generateGeoJson
     * @param coords
     * @returns
     */
    generateGeoJson(coords: { lat: number; lng: number }[]): HeatParams {
      const geoJson: HeatParams = {
        type: 'FeatureCollection',
        features: []
      }

      coords.forEach((coord, key) => {
        geoJson.features.push({
          type: 'Feature',
          properties: {
            id: `coord-${key}`
          },
          geometry: {
            type: 'Point',
            coordinates: [coord.lng, coord.lat, 0.0]
          }
        })
      })

      return geoJson
    },
    /**
     * heatMap
     * @param geoJson
     */
    heatMap(map: mapboxgl.Map, geoJson: HeatParams) {
      map.on('load', () => {
        map.addSource('heatmap_source', {
          type: 'geojson',
          data: geoJson
        })
        // add heatmap layer here

        map.addLayer(
          {
            id: 'heatmap-data',
            type: 'heatmap',
            source: 'heatmap_source',
            maxzoom: 15,
            paint: {
              // increase weight as diameter breast height increases
              'heatmap-weight': {
                property: 'dbh',
                type: 'exponential',
                stops: [
                  [1, 0],
                  [62, 1]
                ]
              },
              // increase intensity as zoom level increases
              'heatmap-intensity': {
                stops: [
                  [11, 1],
                  [15, 3]
                ]
              },
              // assign color values be applied to points depending on their density
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(236,222,239,0)',
                0.2,
                'rgb(208,209,230)',
                0.4,
                'rgb(166,189,219)',
                0.6,
                'rgb(103,169,207)',
                0.8,
                'rgb(28,144,153)'
              ],
              // increase radius as zoom increases
              'heatmap-radius': {
                stops: [
                  [11, 15],
                  [15, 20]
                ]
              },
              // decrease opacity to transition into the circle layer
              'heatmap-opacity': {
                default: 1,
                stops: [
                  [14, 1],
                  [15, 0]
                ]
              }
            }
          },
          'waterway-label'
        )

        // add circle layer here

        map.addLayer(
          {
            id: 'heat-point',
            type: 'circle',
            source: 'heatmap_source',
            minzoom: 14,
            paint: {
              // increase the radius of the circle as the zoom level and dbh value increases
              'circle-radius': {
                property: 'dbh',
                type: 'exponential',
                stops: [
                  [{ zoom: 15, value: 1 }, 5],
                  [{ zoom: 15, value: 62 }, 10],
                  [{ zoom: 22, value: 1 }, 20],
                  [{ zoom: 22, value: 62 }, 50]
                ]
              },
              'circle-color': {
                property: 'dbh',
                type: 'exponential',
                stops: [
                  [0, 'rgba(236,222,239,0)'],
                  [10, 'rgb(236,222,239)'],
                  [20, 'rgb(208,209,230)'],
                  [30, 'rgb(166,189,219)'],
                  [40, 'rgb(103,169,207)'],
                  [50, 'rgb(28,144,153)'],
                  [60, 'rgb(1,108,89)']
                ]
              },
              'circle-stroke-color': 'white',
              'circle-stroke-width': 1,
              'circle-opacity': {
                stops: [
                  [14, 0],
                  [15, 1]
                ]
              }
            }
          },
          'waterway-label'
        )
      })
    }
  }
}

export interface InitMap {
  container: string
  style: string
  center: LngLatLike
  zoom: number
}
