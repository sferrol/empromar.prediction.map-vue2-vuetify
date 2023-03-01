// DateRef
import { computed, ref, watch } from 'vue';
import { format, parseISO, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale';

export default function useMap() {
  // OpenStreetMaps
  //  openstreetmap     https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
  //  osmand            https://tile.osmand.net/hd/{z}/{x}/{y}.png
  //
  // Mapbox Tile Server (Custom to Google Style): Alt style: styles/parksideindoor/cki8uc2193zu919qv2uhe53dk
  //  mapbox            https://api.mapbox.com/styles/v1/parksideindoor/cki8uc2193zu919qv2uhe53dk/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGFya3NpZGVpbmRvb3IiLCJhIjoiY2tnaGU1MHowMDN0czJ6bWU1ajVoeTlneCJ9.KfnSk61OsHyGuvWLn3M6bA
  //
  // Google
  //  Roadmap:          http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}
  //  Terrain:          http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}
  //  Altered roadmap:  http://mt0.google.com/vt/lyrs=r&hl=en&x={x}&y={y}&z={z}
  //  Satellite only    http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}
  //  Terrain only      http://mt0.google.com/vt/lyrs=t&hl=en&x={x}&y={y}&z={z}
  //  Hybrid            http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}
  const tileLayerOptions = [
    {
      id: 'openstreetmap',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      icon: 'mdi-terrain',
      text: 'OS'
    },
    {
      id: 'mapbox',
      url: 'https://api.mapbox.com/styles/v1/parksideindoor/cki8uc2193zu919qv2uhe53dk/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGFya3NpZGVpbmRvb3IiLCJhIjoiY2tnaGU1MHowMDN0czJ6bWU1ajVoeTlneCJ9.KfnSk61OsHyGuvWLn3M6bA',
      attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
      icon: 'mdi-mapbox',
      text: 'MBox'
    },
    {
      id: 'osmand',
      url: 'https://tile.osmand.net/hd/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://osmand.net">OsmAnd</a>',
    },

    {
      id: 'google-roadmap',
      url: 'http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
    },
    {
      id: 'google-terrain',
      url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
    },
    {
      id: 'google-roadmap-alt',
      url: 'http://mt0.google.com/vt/lyrs=r&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
    },
    {
      id: 'google-satellite-only',
      url: 'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
      icon: 'mdi-satellite-variant',
      text: 'GSat'
    },
    {
      id: 'google-terrain-only',
      url: 'http://mt0.google.com/vt/lyrs=t&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
    },
    {
      id: 'google-hybrid',
      url: 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
    },
  ];

  /* FUNCIONS */
  // Arousa: coord = { lat: 42.51994, lng: -8.93902 } // Latitud Norte(+) y Longitud Oeste(-)
  // Google:  [Lat, Lng] = [ 42.51994, -8.93902 ]   // WGS84 - Projection 'EPSG:4326'
  // LeafLet: [Lat, Lng] = [ 42.51994, -8.93902 ]
  const defaultMapCenter = [42.51994, -8.93902]
  const defaultMapZoom = 12 // 12.5
  const defaultMapRotation = 0

  /** Map Center control */
  const getUserMapCenter = () => {
    let coord = localStorage.getItem('map-center') // [Lat, Lng]
    if (coord) {
      coord = JSON.parse(coord)
    }
    return  Array.isArray(coord) || (typeof coord === 'object' && coord?.lat && coord?.lng) ? coord : defaultMapCenter
  }
  const setUserMapCenter = (center) => {
    localStorage.setItem('map-center', JSON.stringify(center)) // Set [Lng, Lat]
  }
  const mapCenter = ref(getUserMapCenter())
  watch(() => mapCenter.value, () => {
    setUserMapCenter(mapCenter.value)
  })

  /** Map Zoom control */
  const getUserMapZoom = () => {
    let zoom = localStorage.getItem('map-zoom') // import number
    if (zoom) {
      zoom = JSON.parse(zoom)
    }
    return (typeof zoom === 'number') ? zoom : defaultMapZoom
  }
  const setUserMapZoom = (zoom) => {
    localStorage.setItem('map-zoom', zoom) // numeric
  }
  const mapZoom = ref(getUserMapZoom())
  watch(() => mapZoom.value, () => {
    setUserMapZoom(mapZoom.value)
  })


  /** Map Rotation control */
  const getUserMapRotation = () => {
    let rotation = localStorage.getItem('map-rotation') // import number
    if (rotation) {
      rotation = JSON.parse(rotation)
    }
    return (typeof rotation === 'number') ? rotation : defaultMapRotation
  }
  const setUserMapRotation = (rotation) => {
    localStorage.setItem('map-rotation', rotation) // numeric
  }
  const mapRotation = ref(getUserMapRotation())
  watch(() => mapRotation.value, () => {
    setUserMapRotation(mapRotation.value)
  })

  /** --- DateRef --- */
  const getLastDateRefUsed = () => {
    const ls = localStorage.getItem('dateRef')
    if (ls === 'now') {
      return format(parseISO(new Date().toISOString()), 'yyyy-MM-dd')
    }
    return localStorage.getItem('dateRef')
  }
  const setLastDateRefUsed = (dateRefString) => {
    if (dateRefString === format(parseISO(new Date().toISOString()), 'yyyy-MM-dd')) {
      localStorage.setItem('dateRef', 'now')
    } else {
      localStorage.setItem('dateRef', dateRefString)
    }
  }

  // Fecha de referencia
  //  dateRef:          String: (2023-02-16)  - Fecha del componente v-datepicker
  //  dateRefFormatted  String: (Jue 16)      - Fecha de visualización
  const dateRef = ref( format(parseISO(getLastDateRefUsed() || new Date().toISOString()), 'yyyy-MM-dd') );
  const dateRefFormatted = computed( () => {
    return dateRef.value ? format(parseISO(dateRef.value), "EEE d", { locale: es }) : ''
  })
  const setDatePrev = () => {
    if (dateRef.value) {
      dateRef.value = format(subDays(parseISO(dateRef.value), 1), 'yyyy-MM-dd');
    }
  }
  const setDateNext = () => {
    if (dateRef.value) {
      dateRef.value = format(addDays(parseISO(dateRef.value), 1), 'yyyy-MM-dd');
    }
  }
  /** */

  return {
    tileLayerOptions,

    // Map Center control
    mapCenter,
    getUserMapCenter,
    setUserMapCenter,

    // Map Zoom control
    mapZoom,
    getUserMapZoom,
    setUserMapZoom,

    // Map Rotation control
    mapRotation,
    getUserMapRotation,
    setUserMapRotation,

    // DateRef
    getLastDateRefUsed,
    setLastDateRefUsed,
    dateRef,
    dateRefFormatted,
    setDatePrev,
    setDateNext,

  };
}
