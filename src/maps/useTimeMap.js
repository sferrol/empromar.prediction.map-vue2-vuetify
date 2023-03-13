import { ref, watch } from "vue"
import axios from 'axios'

import { format, fromUnixTime } from 'date-fns'
import { es } from 'date-fns/locale';

// Leaflet
import L from "leaflet";
import "../plugins/leaflet/Velocity/leaflet-velocity.js"

// Import
// import geojsonDataTest from '../geojson/Velocity/test.json'; // Import vectorLayerGeojsonPMI GeoJSON (LonLat)
import geojsonDataWindGlobal from '../geojson/Velocity/wind-global.json'; // Import vectorLayerGeojsonPMI GeoJSON (LonLat)


export default function useTimeMap() {

  // Options
  const opacityDefault = .5
  const animationIntervalDefault = 500

  // Map control
  const map = ref(null)
  const timestamps = ref([])      // @type { number[] }

  // By Layers
  const radarLayers = ref([])     // Capas indexadas por el timestamp

  // Only one layers with data change
  const velocityDataList = ref([])
  const velocityLayer = ref(null)

  // Current and next index
  const currentTimestamp = ref(null)
  const nextTimestamp = ref(null)

  // const positionSlider = ref({min: 0, max: 10, value: 0})
  const animationPosition = ref(0)
  const animationPositionMin = ref(0)
  const animationPositionMax = ref(7)
  const animationTimer = ref(false)

  //
  const isRainViewerActive = ref(false)
  watch(() => isRainViewerActive.value,
    () => {
      if (isRainViewerActive.value) {
        load(animationPosition.value) // Start at last position
      } else {
        unload()
      }
    })

  const isVelocityViewerActive = ref(false)
  watch( () => isVelocityViewerActive.value,
    () => {
      if (isVelocityViewerActive.value) {
        load(animationPosition.value) // Start at last position
      } else {
        unload()
      }
    })

  // Control de la velocidad (Al cambiar se actualiza sola porque está dentro de la FM play)
  const animationVelocity = ref(1)
  const onChangeAnimationVelocity = () => {
    if (animationVelocity.value >= 2) {
      animationVelocity.value = 0.5
    } else {
      animationVelocity.value = animationVelocity.value + 0.5
    }
  }

  const getAnimationPositionDateFormatter = (index) => {
    const timestamp = timestamps.value[index]
    const result = timestamp ? format(fromUnixTime(timestamp), "EEE d - H:mm", { locale: es }) : ''
    return result
  }

  const onAdd = (_map) => {

    map.value = _map

    timestamps.value = []

    // By Layers (RainViewer)
    radarLayers.value = []

    // Control time stamp
    currentTimestamp.value = null
    nextTimestamp.value = null

    // Animation
    animationPosition.value = 0;
    animationPositionMin.value = 0;
    animationPositionMax.value = 0;
    animationTimer.value = false;

    // Status
    isRainViewerActive.value = false; // watch control
    isVelocityViewerActive.value = false; // watch control
  }


  const fetchTimeStamps = (queryParams) => {
    return new Promise((resolve, reject) => {
      axios
        .get('https://tilecache.rainviewer.com/api/maps.json', { params: queryParams })
        .then(response => resolve(response))
        .catch(error => reject(error))
    })
  }

  // Fetch VelocityData (For timestamp)
  // eslint-disable-next-line no-unused-vars
  const fetchVelocityData = (timestamp) => {
    return new Promise((resolve, reject) => {
      if (geojsonDataWindGlobal) {
        resolve(geojsonDataWindGlobal)
      } else {
        reject()
      }
    })
  }


  const load = (startAtPosition = 0) => {

    // /**
    //  * Load actual radar animation frames this.timestamps from RainViewer API
    //  */
    fetchTimeStamps({}).then(response => {
      timestamps.value = response.data

      // Establecemos el horizonte
      animationPositionMin.value = 0
      animationPositionMax.value = timestamps.value.length - 1

      // Start at position  0: Primero -1: Último
      showFrame(startAtPosition)
    })
  }

  // Elimina las capas del mapa
  const unload = () => {
    // First stop (if running)
    stop()

    // Remove all layers from map (Not from memory)
    if (!isRainViewerActive.value) {
      Object.keys(radarLayers.value).forEach(function (key) {
        if (map.value.hasLayer(radarLayers.value[key])) {
          map.value.removeLayer(radarLayers.value[key])
        }
      })
    }

    // Se ha desactivado la capa y hay una creada
    if (!isVelocityViewerActive.value && velocityLayer.value) {
      if (map.value.hasLayer(velocityLayer.value)) {
        map.value.removeLayer(velocityLayer.value)
      }
    }
  }

  // Añadir la capa (Crearla si no existe + Añadirla al mapa)
  const addLayer = (ts) => {
    // var map = this._map;
    if (!radarLayers.value[ts]) {
      radarLayers.value[ts] = new L.TileLayer('https://tilecache.rainviewer.com/v2/radar/' + ts + '/256/{z}/{x}/{y}/2/1_1.png', {
        tileSize: 256,
        opacity: 0.001,
        transparent: true,
        attribution: '<a href="https://rainviewer.com" target="_blank">rainnviewer.com</a>',
        zIndex: ts
      })
    }
    if (!map.value.hasLayer(radarLayers.value[ts])) {
      map.value.addLayer(radarLayers.value[ts]);
    }
  }

  // Añadir la capa (Crearla si no existe + Añadirla al mapa)
  const addLayerVelocity = async (ts) => {
    // debugger
    if (!velocityDataList.value[ts]) {

      const response = await fetchVelocityData(ts)
      console.log(response)
      // velocityDataList.value[ts] = geojsonDataWindGlobal
      velocityDataList.value[ts] = response
    }

    // Set layer
    if (!velocityLayer.value) {
      velocityLayer.value = new L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: "Global Wind",
          position: "bottomleft",
          emptyString: "No wind data"
        },
        data: velocityDataList.value[ts],
        maxVelocity: 15
      })
    }

    if (!map.value.hasLayer(velocityLayer.value)) {
      map.value.addLayer(velocityLayer.value);
    }

    velocityLayer.value.setData(velocityDataList.value[ts])
  }

  /**
 * Display particular frame of animation for the @position
 * If preloadOnly parameter is set to true, the frame layer only adds for the tiles preloading purpose
 * @param position
 * @param preloadOnly
 */
  const changeRadarPosition = (position, preloadOnly) => {
    while (position >= timestamps.value.length) {
      position -= timestamps.value.length
    }
    while (position < 0) {
      position += timestamps.value.length
    }

    currentTimestamp.value = timestamps.value[animationPosition.value]
    nextTimestamp.value = timestamps.value[position]


    // Layer manayer (Data and layer create)
    if (isRainViewerActive.value) {
      addLayer(nextTimestamp.value)
    }
    if (isVelocityViewerActive.value) {
      addLayerVelocity(nextTimestamp.value)
    }

    if (preloadOnly) {
      return;
    }

    // Indicamos al slider la nueva posición
    animationPosition.value = position

    if (isRainViewerActive.value) {
      switchLayer(currentTimestamp.value, nextTimestamp.value)
    }
  }

  const switchLayer = (currentTimestamp, nextTimestamp) => {

    if (radarLayers.value[currentTimestamp]) {
      radarLayers.value[currentTimestamp].setOpacity(0);
    }
    radarLayers.value[nextTimestamp].setOpacity(opacityDefault);

    //document.getElementById("timestamp").innerHTML = (new Date(this.nextTimestamp * 1000)).toLocaleString();
  }

  /**
 * Check avialability and show particular frame position from the this.timestamps list
 */
  const showFrame = (nextPosition) => {
    var preloadingDirection = nextPosition - (animationPosition.value > 0 ? 1 : -1)

    changeRadarPosition(nextPosition);

    // preload next next frame (typically, +1 frame)
    // if don't do that, the animation will be blinking at the first loop
    changeRadarPosition(nextPosition + preloadingDirection, true);
  }

  // e has same value that animationPosition
  const onChangeAnimationPositionSlider = (newPosition) => {
    // debugger
    // Calculamos la posicion anterior para que el cambio a la nueva capa oculte la anterior
    animationPosition.value = timestamps.value.findIndex(element => element === currentTimestamp.value)
    showFrame(newPosition)
  }

  /**
  * Stop the animation
  * Check if the animation timeout is set and clear it.
  */
  const stop = () => {
    if (animationTimer.value) {
      clearTimeout(animationTimer.value);
      animationTimer.value = false;
      return true;
    }
    return false;
  }

  // eslint-disable-next-line no-unused-vars
  const play = () => {
    showFrame(animationPosition.value + 1);

    // Main animation driver. Run this function every 500 ms
    // animationTimer.value = setTimeout(function(){ play() }.bind(this), animationIntervalDefault);
    animationTimer.value = setTimeout(play, animationIntervalDefault / animationVelocity.value);
  }

  const playStop = () => {
    if (!stop()) {
      play();
    }
  }

  // eslint-disable-next-line no-unused-vars
  const prev = (e) => {
    // L.DomEvent.stopPropagation(e);
    // L.DomEvent.preventDefault(e);
    stop()
    showFrame(animationPosition - 1)

    return
  }

  // eslint-disable-next-line no-unused-vars
  const startstop = (e) => {
    // L.DomEvent.stopPropagation(e);
    // L.DomEvent.preventDefault(e);
    playStop()

  }

  // eslint-disable-next-line no-unused-vars
  const next = (e) => {
    // L.DomEvent.stopPropagation(e);
    // L.DomEvent.preventDefault(e);
    stop();
    showFrame(animationPosition + 1)

    return
  }

  // eslint-disable-next-line no-unused-vars
  const onRemove = (_map) => {
    // Nothing to do here
  }

  return {
    isRainViewerActive,
    isVelocityViewerActive,
    onAdd, // Init
    onRemove,


    // Control
    startstop,
    play,
    stop,
    prev,
    next,
    animationTimer,

    // Slider
    animationPosition,
    animationPositionMin,
    animationPositionMax,
    onChangeAnimationPositionSlider, // Cambio manual de la position
    getAnimationPositionDateFormatter, // Slider thumb time

    // Velocity
    animationVelocity,
    onChangeAnimationVelocity,
  }
}
