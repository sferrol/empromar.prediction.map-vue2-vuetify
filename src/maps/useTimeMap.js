import { ref } from "vue"
import axios from 'axios'

// Leaflet
import L from "leaflet";

export default function useTimeMap() {

  // Options
  const opacityDefault = .5
  const animationIntervalDefault = 1000

  // Map control
  const map = ref(null)
  const timestamps = ref([])      // @type { number[] }
  const radarLayers = ref([])     // Capas indexadas por el timestamp

  const currentTimestamp = ref(null)
  const nextTimestamp = ref(null)

  // const positionSlider = ref({min: 0, max: 10, value: 0})
  const animationPosition = ref(0)
  const animationPositionMin = ref(0)
  const animationPositionMax = ref(12)
  const animationTimer = ref(false)

  const rainviewerActive = ref(false)

  // Control de la velocidad (Al cambiar se actualiza sola porque está dentro de la FM play)
  const animationVelocity = ref(1)
  const onChangeAnimationVelocity = () => {
    if (animationVelocity.value >= 2) {
      animationVelocity.value = 0.5
    } else {
      animationVelocity.value = animationVelocity.value + 0.5
    }
  }

  const onAdd = (_map) => {

    map.value = _map

    timestamps.value = []
    radarLayers.value = []

    // Control time stamp
    currentTimestamp.value = null
    nextTimestamp.value = null

    // Animation
    animationPosition.value = 1;
    animationPositionMin.value = 0;
    animationPositionMax.value = 12;
    animationTimer.value = false;

    // Status
    rainviewerActive.value = false;

    return load(_map)
  }


  const fetchTimeStamps = (queryParams) => {
    return new Promise((resolve, reject) => {
      axios
        .get('https://tilecache.rainviewer.com/api/maps.json', { params: queryParams })
        .then(response => resolve(response))
        .catch(error => reject(error))
    })
  }

  // eslint-disable-next-line no-unused-vars
  const load = (_map) => {

    // /**
    //  * Load actual radar animation frames this.timestamps from RainViewer API
    //  */
    // var t = this;
    // this.apiRequest = new XMLHttpRequest();
    // this.apiRequest.open("GET", "https://tilecache.rainviewer.com/api/maps.json", true);
    // this.apiRequest.onload = function (e) {

    //   // save available this.timestamps and show the latest frame: "-1" means "timestamp.lenght - 1"
    //   t.timestamps = JSON.parse(t.apiRequest.response);
    //   console.log(this);
    //   t.showFrame(-1);
    // };
    // this.apiRequest.send();

    fetchTimeStamps({}).then(response => {
      timestamps.value = response.data
      // showFrame(-1) // Ultimo
      showFrame(0)  // Primero
    })

    // PREV
    // this.prevButton = L.DomUtil.create('input', 'leaflet-control-rainviewer-prev leaflet-bar-part btn', this.controlContainer);
    // this.prevButton.type = "button";
    // this.prevButton.value = this.options.prevButtonText;
    // L.DomEvent.on(this.prevButton, 'click', t.prev, this);
    // L.DomEvent.disableClickPropagation(this.prevButton);

    // START / STOP
    // this.startstopButton = L.DomUtil.create('input', 'leaflet-control-rainviewer-startstop leaflet-bar-part btn', this.controlContainer);
    // this.startstopButton.type = "button";
    // this.startstopButton.value = this.options.playStopButtonText;
    // L.DomEvent.on(this.startstopButton, 'click', t.startstop, this);
    // L.DomEvent.disableClickPropagation(this.startstopButton);

    // NEXT
    // this.nextButton = L.DomUtil.create('input', 'leaflet-control-rainviewer-next leaflet-bar-part btn', this.controlContainer);
    // this.nextButton.type = "button";
    // this.nextButton.value = this.options.nextButtonText;
    // L.DomEvent.on(this.nextButton, 'click', t.next, this);
    // L.DomEvent.disableClickPropagation(this.nextButton);

    // SLIDER
    // this.positionSliderLabel = L.DomUtil.create('label', 'leaflet-control-rainviewer-label leaflet-bar-part', this.controlContainer);
    // this.positionSliderLabel.for = "rainviewer-positionslider";
    // this.positionSliderLabel.textContent = this.options.positionSliderLabelText;

    // this.positionSlider = L.DomUtil.create('input', 'leaflet-control-rainviewer-positionslider leaflet-bar-part', this.controlContainer);
    // this.positionSlider.type = "range";
    // this.positionSlider.id = "rainviewer-positionslider";
    // this.positionSlider.min = 0;
    // this.positionSlider.max = 11;
    // this.positionSlider.value = this.animationPosition;
    // L.DomEvent.on(this.positionSlider, 'input', t.setPosition, this);
    // L.DomEvent.disableClickPropagation(this.positionSlider);

    // this.opacitySliderLabel = L.DomUtil.create('label', 'leaflet-control-rainviewer-label leaflet-bar-part', this.controlContainer);
    // this.opacitySliderLabel.for = "rainviewer-opacityslider";
    // this.opacitySliderLabel.textContent = this.options.opacitySliderLabelText;

    // OPACITY
    // this.opacitySlider = L.DomUtil.create('input', 'leaflet-control-rainviewer-opacityslider leaflet-bar-part', this.controlContainer);
    // this.opacitySlider.type = "range";
    // this.opacitySlider.id = "rainviewer-opacityslider";
    // this.opacitySlider.min = 0;
    // this.opacitySlider.max = 100;
    // this.opacitySlider.value = this.options.opacity*100;
    // L.DomEvent.on(this.opacitySlider, 'input', t.setOpacity, this);
    // L.DomEvent.disableClickPropagation(this.opacitySlider);


    // CLOSE
    // this.closeButton = L.DomUtil.create('div', 'leaflet-control-rainviewer-close', this.container);
    // L.DomEvent.on(this.closeButton, 'click', t.unload, this);
  }

  // Elimina las capas del mapa
  // eslint-disable-next-line no-unused-vars
  const unload = (e) => {
    // L.DomUtil.remove(this.controlContainer);
    // L.DomUtil.remove(this.closeButton);
    // L.DomUtil.removeClass(this.container, 'leaflet-control-rainviewer-active');
    console.log(radarLayers.value);
    // var radarLayersLocal = radarLayers.value;
    // var map = this._map;
    Object.keys(radarLayers.value).forEach(function (key) {
      if (map.value.hasLayer(radarLayers.value[key])) {
        map.value.removeLayer(radarLayers.value[key])
      }
    });
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
      });
    }
    if (!map.value.hasLayer(radarLayers.value[ts])) {
      map.value.addLayer(radarLayers.value[ts]);
    }
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

    addLayer(nextTimestamp.value)

    if (preloadOnly) {
      return;
    }

    // Indicamos al slider la nueva posición
    animationPosition.value = position;
    // positionSlider.value = position;

    if (radarLayers.value[currentTimestamp.value]) {
      radarLayers.value[currentTimestamp.value].setOpacity(0);
    }
    radarLayers.value[nextTimestamp.value].setOpacity(opacityDefault);

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

  /**
  * Stop the animation
  * Check if the animation timeout is set and clear it.
  */
  // const setOpacity = (e) => {
  //   console.log(e.srcElement.value/100);
  //   if (this.radarLayers[this.currentTimestamp]) {
  //     this.radarLayers[this.currentTimestamp].setOpacity(e.srcElement.value/100);
  //   }
  // }
  // const setPosition = (e) => {
  //   showFrame(e.srcElement.value)
  // }

  // e has same value that animationPosition
  // eslint-disable-next-line no-unused-vars
  const onChangeAnimationPositionSlider = (newPosition) => {
    // debugger
    // Calculamos la posicion anterior para que el cambio a la nueva capa oculte la anterior
    animationPosition.value = timestamps.value.findIndex(element => element === currentTimestamp.value)
    showFrame(newPosition)
  }


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

    // Velocity
    animationVelocity,
    onChangeAnimationVelocity,
  }
}
