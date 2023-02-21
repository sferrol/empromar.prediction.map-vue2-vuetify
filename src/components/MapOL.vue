<template>

  <div id="custom-map-wrapper">

    <!-- Toxin type -->
    <div class="toxin-type-wrapper" :class="[ xs ? 'toxin-type-wrapper-bottom' : 'toxin-type-wrapper-top' ]">
      <!-- v-if="toxinTypeSelected" -->
      <forecast-toxin-type
        :toxin-type-selected.sync="toxinTypeSelected"
        :toxin-type-options="toxinTypeOptions"
        :loading="loading"
      />
    </div>

    <!-- Date: Prev + Date + Next [Mismo estilo que el toolbar]-->
    <div class="data-ref-wrapper" :class="[ xs ? 'data-ref-wrapper-bottom' : 'data-ref-wrapper-top' ]">
      <div class="d-flex align-center" style="height: 56px;">
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-on="on"
              v-bind="attrs"
              color="primary"
              fab
              small
              @click="setDatePrev()"
            >
              <v-icon size="24">mdi-chevron-left</v-icon>
            </v-btn>
          </template>
          <span>Anterior</span>
        </v-tooltip>

        <!-- v-model="modal" -->
        <v-dialog
          ref="dialog"
          :return-value.sync="dateRef"
          width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-on="on"
              v-bind="attrs"
              class="mx-1"
              color="primary"
              x-lange
            >
              {{ dateRefFormatted }}
              <v-progress-linear
                v-if="loading"
                style="position: absolute; top: 17px;"
                color="deep-purple accent-4"
                indeterminate
                rounded
                height="4"
              ></v-progress-linear>
            </v-btn>

          </template>
          <v-date-picker
            v-model="dateRef"
            scrollable
            @input="$refs.dialog.save(dateRef)"
          />
        </v-dialog>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-on="on"
              v-bind="attrs"
              color="primary"
              fab
              small
              @click="setDateNext()"
            >
              <v-icon size="24">mdi-chevron-right</v-icon>
            </v-btn>
          </template>
          <span>Siguiente</span>
        </v-tooltip>
      </div>
    </div>

    <!-- <div class="overlay-loading">
      <v-progress-circular color="white" indeterminate :size="35" v-if="loading"></v-progress-circular>
    </div> -->

    <!-- :style="{ height: xs ? '100%' : 'unset' }"> -->
    <div
      v-if="forecastSelected"
      class="overlay-forecast-wrapper"
      :class="{ 'overlay-forecast-wrapper-mobile' : $vuetify.breakpoint.xs || !forecastMinimize }"
    >

      <!-- Imagen -->
      <!-- <img
        v-if="xs || !forecastMinimize"
        style="width: 100%; height: 100px;"
        src="../assets/default_thumbnail.png" /> -->
      <!-- <img
        v-if="xs || !forecastMinimize"
        style="width: 100%;"
        src="../assets/forecast_beach.jpeg" /> -->
      <div
        v-if="xs || !forecastMinimize"
        :style="{
          'background-image':'url(assets/forecast_beach.jpeg)',
          height: '130px',
          'background-size': 'cover',
          'background-position-y': 'center'
        }"></div>

      <ForecastCard
        :forecast="forecastSelected"
        :minimize="forecastMinimize"
        @update:minimize="forecastMinimize = $event"
        @close="forecastSelected = null">
      </ForecastCard>
    </div>

    <vl-map
      ref="map"
      :loadTilesWhileAnimating="false"
      :loadTilesWhileInteracting="false"
      style="height: 100%">

      <!-- @zoomChanged="mapZoomUpdate" -->
      <!-- @centerChanged="mapCenterUpdate" -->
      <vl-view
        ref="view"
        :center.sync="mapCenter"
        :rotation.sync="mapRotation"
        :zoom.sync="mapZoom"
        :projection="mapProjection"
      />
      <!-- Activamos fullscrren control -->
      <!-- <vl-fullscreen-control /> -->

      <!-- TileLayer: Switch with external controlled -->
      <vl-layer-tile v-if="tileLayerSelected">
        <vl-source-xyz :url="tileLayerSelected.url" />
      </vl-layer-tile>

      <!-- GEOJSON (Zonas de produccion): Indicamos un estilo por defecto y luego sobrescribimos la predicción -->
      <vl-layer-vector v-if="showLayerPOL">
        <!-- <vl-source-vector :features="vectorLayerGeojsonPOL" :format="geoJsonFormat" >
          <vl-style :overrideStyleFunction="overrideStyleFunction">
            <vl-style-stroke color="blue" :width="2"></vl-style-stroke>
            <vl-style-fill color="rgba(255,255,255,0.1)"></vl-style-fill>
          </vl-style>
        </vl-source-vector> -->
        <vl-source-vector :features="vectorLayerGeojsonPOL" >
          <vl-style-func :factory="styleFuncFactoryPOL" />
        </vl-source-vector>
      </vl-layer-vector>

      <!-- Geojson PMI -->
      <vl-layer-vector v-if="showLayerPMI">
        <vl-source-vector :features="vectorLayerGeojsonPMI" >
          <vl-style-func :factory="styleFuncFactoryPMI" />
        </vl-source-vector>
        <!-- <vl-style-box>
          <vl-style-circle :radius="10">
            <vl-style-fill color="#c23b8e"></vl-style-fill>
            <vl-style-stroke color="black"></vl-style-stroke>
          </vl-style-circle>
        </vl-style-box> -->
        <!-- <vl-style-box>
          <vl-style-icon src="https://img.icons8.com/ultraviolet/50/000000/place-marker.png" :anchor="[0.5, 1]"></vl-style-icon>
          <vl-style-text text="Free Space" font="14px monospace"></vl-style-text>
        </vl-style-box> -->
      </vl-layer-vector>

      <!-- Al pasar por envima de la zona de producción -->
      <!-- <vl-interaction-select v-if="!$vuetify.breakpoint.mobile" @select="featureSelectedPointerMove" :condition="selectConditionPointerMove" :filter="selectInteactionFilter"> -->
      <vl-interaction-select
        v-if="!$vuetify.breakpoint.mobile"
        @select="featureSelectedPointerMove"
        @unselect="featureSelectedPointerMove"
        :condition="selectConditionPointerMove" :filter="selectInteactionFilter">
        <vl-style>
          <vl-style-stroke color="green" :width="1"></vl-style-stroke>
          <vl-style-fill color="rgba(255,255,255,0.1)"></vl-style-fill>
        </vl-style>
      </vl-interaction-select>

      <!-- Esta interacción se define manualmente para indicar el estilo de la predicción al seleccionar el polígono -->
      <!-- <vl-interaction-select @select="featureSelectedSingleClick" :condition="selectConditionSingleClick" :filter="selectInteactionFilter"> -->
      <!-- <vl-style>
          <vl-style-stroke color="green" :width="1"></vl-style-stroke>
          <vl-style-fill color="rgba(255,255,255,0.1)"></vl-style-fill>
        </vl-style> -->
      <!-- </vl-interaction-select> -->

      <!-- Visualizamos la predicción al pasar por encima: Separamos del cursor para que se vea -->
      <!-- <template v-slot="slotProps"> -->
      <!-- {{selectedPMForecast.name}} - {{slotProps}} -->
      <vl-overlay :position="selectedPMPosition" v-if="selectedPMForecast || isHoverForecast">
        <div :style="{ 'min-width': '400px' }">
          <div>
            <v-hover v-model="isHoverForecast">
              <ForecastCard :forecast="selectedPMForecast" v-if="selectedPMForecast"></ForecastCard>
            </v-hover>
          </div>
        </div>
      </vl-overlay>

      <!-- Punto selector de polígono seleccionado: Selección vía búsqueda externa -->
      <vl-layer-vector v-if="layerSelectedPoint">
        <vl-source-vector>
          <vl-feature>
            <!-- <vl-geom-point :coordinates="layerSelectedPoint" /> -->
            <vl-geom-circle :coordinates="layerSelectedPoint" :radius="0.001"></vl-geom-circle>
            <vl-style>
              <vl-style-stroke color="red" :width="1"></vl-style-stroke>
              <vl-style-fill color="rgba(255,255,255,0.5)"></vl-style-fill>
            </vl-style>
            <!-- <vl-style-box>
              <vl-style-stroke color="blue"></vl-style-stroke>
              <vl-style-fill color="rgba(255,255,255, 0.1)"></vl-style-fill>
              <vl-style-text text="I'm circle"></vl-style-text>
            </vl-style-box> -->
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>

    </vl-map>
  </div>
</template>

<script>
  // eslint-disable-next-line no-unused-vars
  import { ref, watch, inject, onMounted, computed } from 'vue';
  import axios from 'axios';
  import { useVuetify } from '../composables/useVuetify'

  // import L from 'leaflet';  // Import native leaflet
  import * as turf from '@turf/turf'; // Import turf for GIS functions
  import * as turfHelper from '@turf/helpers';  // Import turfHelper for GIS function helpers

  // Openlayer modules
  import { GeoJSON } from 'ol/format';
  import {pointerMove} from 'ol/events/condition.js';
  // import { Extent } from 'ol/extent';
  // import { selectconditions } from 'vl-selectconditions'
  // eslint-disable-next-line no-unused-vars
  import {Fill, Stroke, Style, Circle } from 'ol/style.js';
  // import GeometryCollection from 'ol/geom/GeometryCollection.js';
  import { getCenter } from 'ol/extent';

  // Vuelayers
  // eslint-disable-next-line no-unused-vars
  import { createStyle, defaultStyle} from 'vuelayers/dist/ol-ext'

  // GeoJSON File Imports
  //import zoneListArousa from '../geojson/POL_Interior_Arousa.json'; // Import vectorLayerGeojsonPOL GeoJSON (LonLat)
  import geojsonDataPOL from '../geojson/POL.json'; // Import vectorLayerGeojsonPOL GeoJSON (LonLat)
  import geojsonDataPMI from '../geojson/PMI.json'; // Import vectorLayerGeojsonPMI GeoJSON (LonLat)

  import useMap from '@/service/useMap';

  // Components
  import ForecastCard from './ForecastCardV.vue'
  import ForecastToxinType from './ForecastToxinType.vue';

  // DateRef
  import { format, parseISO, addDays, subDays } from 'date-fns'
  import { es } from 'date-fns/locale';

  // URL connection
  //  8060 -> symfony API
  //  8062 -> @fake-db
  // const API_BASE = '' // @fake-db
  // const API_BASE = 'http://localhost:8060/api'
  //const XDEBUG = process.env.VUE_APP_XDEBUG || false // X-DEBUG indicator
  // const API_BASE = import.meta.env.VITE_API_BASE
  const API_BASE = process.env.VUE_APP_API_BASE

  export default {
    name: "map-component",
    components: {
      ForecastCard,
      ForecastToxinType,
    },
    props: {
      baseLayer: {
        type: String,
        default: 'openstreetmap',
      },
      showLayerPOL: {
        type: Boolean,
        default: true,
      },
      showLayerPMI: {
        type: Boolean,
        default: true,
      },
    },
    setup(props) {
      // const { mobile, xs } = useDisplay() // vuetify 3
      // $vuetify.breakpoint.xs $vuetify.breakpoint.mobile
      const vuetify = useVuetify();
      const mobile = computed(() => vuetify.breakpoint.mobile);
      const xs = computed(() => vuetify.breakpoint.xs);


      // ToxinType
      const toxinTypeOptions = [
        { value: 'DSP', text: 'LIPO', color: 'blue', image: ''},
        { value: 'ASP', text: 'ASP', color: 'orange', image: ''},
        { value: 'PSP', text: 'PSP', color: 'green', image: ''},
      ];
      const toxinTypeSelected = ref(toxinTypeOptions.find(item => item.value === (localStorage.getItem('toxinType') || 'DSP')));


      /** --- DATEREF --- */
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


      // Actualizar la predicción al cambiar el contexto
      watch([
        () => dateRef.value,
        () => toxinTypeSelected.value
      ], () => {
        if (dateRef.value) {
          setLastDateRefUsed(dateRef.value)
        }
        if (toxinTypeSelected.value) {
          localStorage.setItem('toxinType', toxinTypeSelected.value.value)
        }
        loadForecastAll()
      })

      /* FUNCIONS */
      const defaultMapCenter = [42.51994, -8.93902] // podría ser un objecto LatLon = { lat: 42.51994, lng: -8.93902 }
      const defaultMapZoom = 12.5

      const getUserMapCenter = () => {
        let coord = localStorage.getItem('map-center') // [Lng, Lat]
        if (coord) {
          coord = JSON.parse(coord)
        }
        return  Array.isArray(coord) ? coord : defaultMapCenter
      }
      const setUserMapCenter = (center) => {
        localStorage.setItem('map-center', JSON.stringify(center)) // Set [Lng, Lat]
      }

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

      const getUserMapRotation = () => {
        return localStorage.getItem('map-rotation') || 0
      }


      // Coordinate conversion:
      //  Normal:   { lat: 42.51994, lng: -8.93902 } => [42.51994, -8.93902]
      //  Reverso:  { lat: 42.51994, lng: -8.93902 } => [-8.93902, 42.51994] Use in EPSG:4326
      // eslint-disable-next-line no-unused-vars
      // const convert2Coordinate = (latLng) => {
      //   return [latLng.lat, latLng.lng]
      // }
      // const convert2CoordinateReverse = (latLng) => {
      //   return [latLng.lng, latLng.lat]
      // }
      // const convert2CoordinateReverse = (latLngArray) => {
      //   return [latLngArray[1], latLngArray[0]]
      // }
      // Set up x/y box boundary for map
      //  -9.313264264027785, 42.16707798644801, -8.488283058107688, 42.884309902262885
      //  Left-top: 42.65416193033991, -87.87676334381104
      //  Right-bottom: 42.637652611643716, -87.8353500366211
      //  Center: 42.64608415262391, -87.85539794400394
      // const centerBound = getUserCenter(); // L.latLng(42.51994, -8.93902);
      // const firstBound = L.latLng(42.16707798644801, -9.313264264027785);
      // const secondBound = L.latLng(42.884309902262885, -8.488283058107688);


      // Productions Zones
      // Geojson:
      //  EPSG:4326 equivale a WGS84 => L.CRS.EPSG4326 (Default) (LNG-LAT)
      //  EPSG 3857 google Earth
      // const productionZoneList = { type: "FeatureCollection", features: zoneListArousa.features }; // Geojson is LonLat coordinates
      const vectorLayerGeojsonPOL = ref(geojsonDataPOL.features)
      const vectorLayerGeojsonPMI = ref(geojsonDataPMI.features)

      // Map
      const view = ref(null)
      const map = ref(null)

      const mapProjection = ref('EPSG:4326')    // EPSG:3857 - Proyección WGS84 / Pseudo-Mercator (Usa [Lng,Lat])
      const mapCenter = ref(getUserMapCenter()) // convert2CoordinateReverse() Trabajamos directamente con [Lng,Lat]
      const mapZoom = ref(getUserMapZoom())
      const mapRotation = ref(getUserMapRotation())


      // >>> Base layer selection
      const { tileLayerOptions } = useMap()

      const baseLayerLocal = ref(JSON.parse(JSON.stringify(props.baseLayer)))
      const tileLayerSelected = ref(null) // { id, url, attibutions }

      // props passed to setup function is reactive object (made probably by reactive()), it's properties are getters.
      // Watching a getter: https://v3.vuejs.org/api/computed-watch-api.html#watching-a-single-source
      watch(() => props.baseLayer, () => {
        baseLayerLocal.value = JSON.parse(JSON.stringify(props.baseLayer))

        onBaseLayerChange(baseLayerLocal.value)
      })

      // Change base layer
      const onBaseLayerChange = (baseLayer = 'openstreetmap') => {
        tileLayerSelected.value = tileLayerOptions.find(item => item.id === baseLayer)
      }
      onBaseLayerChange(baseLayerLocal.value)
      // <<<

      // >>> GEOJSON
      // const format = inject('ol-format')
      // const geoJsonFormat = new format.GeoJSON()
      const geoJsonFormat = new GeoJSON()
      // vectorLayerGeojsonPOL.value = (new GeoJSON()).readFeatures(productionZoneList)
      // vectorLayerGeojsonPOL.value = geoJsonFormat.readFeatures(productionZoneList)

      // TODO - Se sustituye por styleFuncFactoryPOL
      // const overrideStyleFunction = (feature, style) => {
      //   const properties = feature.getProperties()
      //   if (properties?.data?.forecast) {
      //     style = getForecastStyle(properties?.data?.forecast)
      //     feature.setStyle(style)
      //   }
      // }
      // TODO - Se puede optimizar con una funcion matemática conociendo el rango
      // Se puede usar el zoom actual que es un parametro que conocemos mejor
      // Para la proyeccion EPSG:4326 -> Rango: 0.703125 (mayor) a 0.000001 (menor resolución)
      //  0.00009086444068959228 -> 3
      //  0.00018341619973591912 -> 2.5
      //  0.00021139523061532628 -> 2
      //  0.0002688142287099566  -> 2
      //  0.00036579971708701025 -> 1
      const calcStrikeWidth = (resolution) => {
        if (resolution < 0.0001) {
          return 4
        }
        if (resolution < 0.0002) {
          return 3
        }
        if (resolution < 0.0003) {
          return 2
        }
        if (resolution < 0.0004) {
          return 1
        }
        return 0.5
      }
      // eslint-disable-next-line no-unused-vars
      const calcCircleRadius = (resolution) => {
        return (resolution * 40000) < 10 ? (resolution * 40000) : 10
      }

      // >>> POL
      const styleFuncFactoryPOL = () => {
        // cache to allow styles reusing for features with same state
        // let cache = {}
        // pre build some shared styles
        //  let blueStroke = new Stroke({color: "blue"})

        const defaultStylePOL = [
          createStyle({
            strokeColor: 'blue',
            strokeWidth: 3,
            fillColor: [255, 255, 255, 0.1], // // rgba(255,255,255,0.1)
          }),
        ]

        // feature - ol.Feature instance
        // resolution - current view resolution as float
        return (feature, resolution) => {
          const properties = feature.getProperties()
          if (properties?.data?.forecast) {
            return [getForecastStyle(properties?.data?.forecast, calcStrikeWidth(resolution))]
          }
          return defaultStylePOL
        }
      }

      // eslint-disable-next-line no-unused-vars
      const calculateCircleRadius = (currentResolution, currentZoom) => {
        // debugger
        // Obtener la resolución actual del mapa view.value
        // const currentResolution = map.value.getView().getResolution();

        // Calcular el radio en píxeles en función del nivel de zoom
        // const zoom = view.value.getZoom();
        const radiusInPixels = 10 * Math.pow(2, currentZoom);

        // Calcular el radio en unidades de mapa
        const radiusInMapUnits = radiusInPixels * currentResolution;

        return radiusInMapUnits;
      }
      // >>> PMI
      const styleFuncFactoryPMI = () => {
        var pointStyle = new Style({
          image: new Circle({
            radius: 10,
            fill: new Fill({
              color: [255, 255, 255, 0]
            }),
            stroke: new Stroke({
              color: 'yellow',
              width: 2
            })
          })
        });
        // debugger


        // feature - ol.Feature instance
        // resolution - current view resolution as float
        // eslint-disable-next-line no-unused-vars
        return (feature, resolution) => {

          // const properties = feature.getProperties()
          // if (properties?.data?.forecast) {
          //   return [getForecastStyle(properties?.data?.forecast, calcStrikeWidth(resolution))]
          // }
          // pointStyle.getImage().setRadius(calculateCircleRadius(resolution, mapZoom.value))
          pointStyle.getImage().setRadius((0.004 / resolution))
          pointStyle.getImage().getStroke().setWidth(calcStrikeWidth(resolution))
          return [pointStyle]

          // Modificamos el radio en función de la resolución
          // return [
          //   new Style({
          //     image: new Circle({
          //       radius: (0.004 / resolution), // > resolución ==> + paqueño
          //       fill: new Fill({
          //         color: [255, 255, 255, 0]
          //       }),
          //       stroke: new Stroke({
          //         color: 'yellow',
          //         width: 1
          //       })
          //     })
          //   })
          // ]
        }
      }
      /// <<<


      // >>> Events
      const forecastSelected = ref(null)
      const forecastMinimize = ref(true)
      const showForecast = (forecast) => {
        forecastSelected.value = forecast;
      }

      // On click feature
      const onFeatureClick = async (event) => {
        const pixel = event.pixel || [event.layerX, event.layerY]
        var feature = await map.value.forEachFeatureAtPixel(pixel, function(feature) {
          return feature;
        })
        if (feature) {
          const properties = feature.getProperties()
          showForecast(properties?.data?.forecast)

          // Indicamos la coordenada donde mostraremos un círculo (Vers tags arriba)
          if (feature?.getGeometry()?.getCoordinates()) {
            layerSelectedPoint.value = getCenterCoordinateOfPoligone(feature.getGeometry().getCoordinates())
          }
        } else {
          if (forecastMinimize.value) {
            showForecast(null)
          }
        }
      }

      // Despues de haber creado el mapa...
      onMounted( () => {
        // debugger
        // >>> Map Click: Creamos un evento para controlar cuando hace click fuera del polígono
        // map.value.on('click', onFeatureClick)
        map.value.$el.addEventListener('click', onFeatureClick, false)
      })

      // Mouse control
      // const extent = inject('ol-extent');
      // const selectConditions = inject('vl-selectconditions')

      const isHoverForecast = ref(false)
      const selectedPMPosition = ref([])
      const selectedPMForecast = ref(null)
      // const selectConditionPointerMove = selectConditions.pointerMove;
      const selectConditionPointerMove = pointerMove;
      const featureSelectedPointerMove = (event) => {

        // selectedPMForecast.value = null
        // selectedPMPosition.value = []
        // debugger
        // Si hay algo seleccionado
        // if (event?.selected && event?.selected.length > 0) {
        if (event.type === 'select' && event?.feature && !isHoverForecast.value) {
          // selectedPMPosition.value = extent.getCenter(event.selected[0].getGeometry().extent_)
          selectedPMPosition.value = getCenter(event.feature.getGeometry().extent_)

          const properties = event.feature.getProperties()
          if (properties?.data?.forecast) {
            selectedPMForecast.value = properties?.data?.forecast
          }
        }

        //
        if (event.type === 'unselect' && !isHoverForecast.value) {
          selectedPMForecast.value = null
        }
      }
      watch(() => isHoverForecast.value, () => {
        if (!isHoverForecast.value) {
          selectedPMForecast.value = null
        }
      })


      // Todas las Features con data
      const selectInteactionFilter = (feature) => {
        return feature.values_.data != undefined;
      }
      // <<<

      // zoomUpdate: updates a data property with the current zoom level dynamically
      // also changes the visibility of building or room labels based on zoom level
      // watch(() => mapRotation.value, () => {})
      watch(() => mapZoom.value, () => {
        setUserMapZoom(mapZoom.value)
      })
      watch(() => mapCenter.value, () => {
        setUserMapCenter(mapCenter.value)
      })


      // Go smooth
      //  view.value.setCenter(coordinate)
      //  view.value.setZoom(11.5)
      const goToSpot = (coordinate = [0, 0]) => {
        view.value.animate({
          center: coordinate,
          duration: 1000
        });
        view.value.animate({
          zoom: 12.5,
          duration: 1000
        });
      }
      // goMapHome: Pans back to the center of the map
      const goMapHome = () => {
        goToSpot(mapCenter.value)
      }

      // Called from the Home component when a room is searched,
      // this method handles changing the floor level, then pans and zooms to the desired location
      const layerSelectedPoint = ref(null)
      const getCenterCoordinateOfPoligone = (coordinates) => {

        // Create a latLng coordinate at the requested polygon
        var poly = turfHelper.polygon(coordinates, { name: 'poly'});
        var center = turf.centerOfMass(poly);
        var coordinate = [center.geometry.coordinates[0], center.geometry.coordinates[1]]

        return coordinate
      }
      const goProductionZone = (productionZoneGeojson) => {

        // TODO - productionZoneGeojson no ha sido actualizado por lo que no tiene todo el data
        // const properties = feature.getProperties()
        if (productionZoneGeojson?.properties?.data?.forecast) {
          showForecast(productionZoneGeojson?.properties?.data?.forecast)
        }

        // Create a latLng coordinate at the requested polygon
        // var poly = turfHelper.polygon(productionZoneGeojson.geometry.coordinates, { name: 'poly'});
        // var center = turf.centerOfMass(poly);
        // var coordinate = [center.geometry.coordinates[0], center.geometry.coordinates[1]]
        var coordinate = getCenterCoordinateOfPoligone(productionZoneGeojson.geometry.coordinates)

        // Indicamos la coordenada donde mostraremos un círculo (Vers tags arriba)
        layerSelectedPoint.value = coordinate

        // Pan to the location of the coordinatex
        // currentCenter.value = coordinate
        goToSpot(coordinate)
      }

      // Forecast
      const loading = ref(false)

      const overWriteForecastData = ( forecast ) => {
        const pmId = forecast.forecastItemHeader.forecastHeader.pm.id
        const pmName = forecast.forecastItemHeader.forecastHeader.pm.poligono

        // Method 1:
        // for (let i = 0; i < vectorLayerGeojsonPOL.value.length; i++) {

        //   // Asignar el forecast al polígono
        //   const properties = vectorLayerGeojsonPOL.value[i].getProperties()
        //   if (properties?.id === pmId) {
        //     properties.data = forecast
        //     break;
        //   }
        // }

        // Method 2:
        vectorLayerGeojsonPOL.value = vectorLayerGeojsonPOL.value.map( (feature) => {
          const properties = feature.properties

          if (properties?.id === pmId || properties?.name === pmName) {
            if (!properties.data) {
              properties.data = { }
            }
            properties.data.forecast = forecast
          }
          feature.properties = properties

          return feature
        })
      }

      const onLoadForecast = (riaId) => {
        // const url = `${API_BASE}/public/forecast?riaId=5&dateRef=${dateRef.value}$toxinType=${toxinTypeSelected.value}`
        const params = {
          riaId: riaId,
          dateRef: dateRef.value || '',
          toxinType: toxinTypeSelected.value?.value || ''
        }
        var queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
        const url = `${API_BASE}/public/forecast?${queryString}`


        loading.value = true;
        axios
          // .get('http://localhost:8050/public/forecast?pmId=1&dateRef=1-08-2022')
          // .get('http://localhost:8050/public/forecast?riaId=5&dateRef=1-08-2022')
          // .get(`${API_BASE}/public/forecast?riaId=5&dateRef=1-08-2022`)
          .get(url)
          .then(response => {
            if (response?.data?.forecasts) {
              response?.data.forecasts.map((forecast) => {
                overWriteForecastData(forecast)
              })
            }
          })
          .catch(error => {
            console.error(error);
          })
          .finally( () => {
            loading.value = false;
          })
      }
      const loadForecastAll = (riaIds = [2,4,5,6]) => {
        const tasks = riaIds.map(riaId => onLoadForecast(riaId))
        Promise.all(tasks).finally(() => {
          loading.value = false;
        })
      }
      // onLoadForecast(5)
      loadForecastAll([2,4,5,6])


      // Forecast
      const getForecastStyle = (forecast, strokeWidth = 3) => {
        let toxAForecastColor
        let analisisColor

        if (forecast) {
          forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets.map((forecastBucket) => {
            if (forecastBucket.name === 'ToxA-Forecast') {
              toxAForecastColor = forecastBucket.color
            }
            if (forecastBucket.name === 'Analisis') {
              analisisColor = forecastBucket.color
            }
          })
        }
        const fill = new Fill({
          color: toxAForecastColor || '#3388ff', // 'rgba(255,255,255,0.1)',
          opacity: 0.1 // Not working
        });
        const stroke = new Stroke({
          color: analisisColor || '#fff8eb',
          width: strokeWidth || 3,
          opacity: 0.1
        });

        // Return v-style
        // return new Style({
        //   fill: fill,
        //   stroke: stroke,
        // })
        return createStyle({
          strokeColor: stroke.getColor(),
          strokeWidth: stroke.getWidth(),
          fillColor: fill.getColor(), //[222, 189, 36, 0.8],
        })
      }

      return {
        mobile, // Desactivar mousePointer
        xs,
        vuetify,
        loading,

        // ToxinType: [DSP, ASP, PSP]
        toxinTypeSelected,
        toxinTypeOptions,

        // DateRef
        dateRef,
        dateRefFormatted, // Computed DateRef with format
        setDatePrev,
        setDateNext,

        // Map
        map,
        view,
        mapProjection,
        mapRotation,
        mapCenter,
        mapZoom,
        // Map functions
        mapZoomUpdate: setUserMapZoom,
        mapCenterUpdate: setUserMapCenter,
        goMapHome,
        goProductionZone,

        // Tile Layer
        tileLayerOptions, // All tile layers in object(id, url, attibuttion)
        tileLayerSelected,
        onBaseLayerChange, // Parent control (No sería necesario porque ya tenemos watch)

        // Vector layer
        geoJsonFormat,
        // Vector Layers POL (GeoJSON data)
        vectorLayerGeojsonPOL,
        styleFuncFactoryPOL,
        layerSelectedPoint, // Circle with the last search PM (vectorLayerGeojsonPOL)

        // Vector Layers PMI (GeoJSON data)
        vectorLayerGeojsonPMI,
        styleFuncFactoryPMI,

        // MouseMove: Forecast PopUp
        isHoverForecast,
        selectedPMPosition,
        selectedPMForecast,
        selectConditionPointerMove, // PointerMove condition
        featureSelectedPointerMove, // event on PointerMove
        selectInteactionFilter,     // Filter (Only features with data)

        // MouseClick: Forecast fix box
        forecastSelected,
        forecastMinimize,
      }
    },
  }
</script>

<!--- Scoped styles only apply to this component --->
<style lang="scss" scoped>

  .toxin-type-wrapper {
    background: none;
    position: absolute;
    z-index: 2;
    padding: 10px;
  }
  .toxin-type-wrapper-top {
    top: 0;
    right: 10px;
  }
  .toxin-type-wrapper-bottom {
    bottom: 0;
    right: 10px;
  }

  .data-ref-wrapper {
      background: none;
      position: absolute;
      z-index: 2;
      padding: 10px;
  }
  .data-ref-wrapper-top {
    top: 0;
    right: 80px;
  }
  .data-ref-wrapper-bottom {
    bottom: 0;
    left: 10px;
  }

  .overlay-loading {
    height: 100%;
    right:0;
    top:10px;
    margin-right:15px;
    position:absolute;
    z-index:1;
  }

  .overlay-forecast-wrapper{
    position: absolute;
    bottom: 0;
    max-width: 420px;
    z-index: 1;
    width: 100%;
  }

  .overlay-forecast-wrapper-mobile {
    height: 100%;
    background: white;
  }

  /* Custom Map Wrapper for formatting map components */
  div#custom-map-wrapper {
    height:100%;
    width:100%;
  }

  /* Set map component format */
  div#map {
    display:block;
  }

</style>
