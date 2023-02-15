<template>

  <div id="custom-map-wrapper">

    <div class="overlay-loading">
      <v-progress-circular color="white" indeterminate :size="35" v-if="loading"></v-progress-circular>
    </div>

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

      <vl-view
        ref="view"
        :center="mapCenter"
        :rotation="mapRotation"
        :zoom="mapZoom"
        :projection="mapProjection"
        @zoomChanged="mapZoomUpdate"
        @centerChanged="mapCenterUpdate"
      />
      <!-- Activamos fullscrren control -->
      <!-- <vl-fullscreen-control /> -->

      <!-- TileLayer: Switch with external controlled -->
      <vl-layer-tile v-if="tileLayerSelected">
        <vl-source-xyz :url="tileLayerSelected.url" />
      </vl-layer-tile>

      <!-- GEOJSON (Zonas de produccion): Indicamos un estilo por defecto y luego sobrescribimos la predicción -->
      <vl-layer-vector>
        <!-- <vl-source-vector :features="productionZones" :format="geoJsonFormat" >
          <vl-style :overrideStyleFunction="overrideStyleFunction">
            <vl-style-stroke color="blue" :width="2"></vl-style-stroke>
            <vl-style-fill color="rgba(255,255,255,0.1)"></vl-style-fill>
          </vl-style>
        </vl-source-vector> -->
        <vl-source-vector :features="productionZones" >
          <vl-style-func :factory="styleFuncFactory" />
        </vl-source-vector>
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

      <!-- Visualizamos la predicción al pasar por encima -->
      <!-- <template v-slot="slotProps"> -->
      <!-- {{selectedPM.name}} - {{slotProps}} -->
      <vl-overlay :position="selectedPMPosition" v-if="selectedPM">
        <div :style="{ 'min-width': '400px' }">
          <div style="display:block; margin-top:10px; padding:16px">
            <ForecastCard :forecast="selectedPM.forecast" v-if="selectedPM.forecast"></ForecastCard>
          </div>
        </div>
      </vl-overlay>

      <!-- Punto selector de polígono seleccionado: Selección vía búsqueda externa -->
      <vl-layer-vector v-if="layerSelectedPoint">
        <vl-source-vector>
          <vl-feature>
            <vl-geom-point :coordinates="layerSelectedPoint" />
          </vl-feature>
        </vl-source-vector>
      </vl-layer-vector>

    </vl-map>
  </div>
</template>

<script>
  // eslint-disable-next-line no-unused-vars
  import { ref, watch, inject, onMounted } from 'vue';
  import axios from 'axios';

  // import L from 'leaflet';  // Import native leaflet
  import * as turf from '@turf/turf'; // Import turf for GIS functions
  import * as turfHelper from '@turf/helpers';  // Import turfHelper for GIS function helpers

  // Openlayer modules
  import { GeoJSON } from 'ol/format';
  import {pointerMove} from 'ol/events/condition.js';
  // import { Extent } from 'ol/extent';
  // import { selectconditions } from 'vl-selectconditions'
  // eslint-disable-next-line no-unused-vars
  import {Fill, Stroke, Style} from 'ol/style.js';
  import { getCenter } from 'ol/extent';

  // Vuelayers
  import {createStyle} from 'vuelayers/dist/ol-ext'

  // GeoJSON File Imports
  import zoneListArousa from '../geojson/POL_Interior_Arousa.json'; // Import productionZones GeoJSON (LonLat)

  import useMap from '@/service/useMap';
  // import { useDisplay } from 'vuetify'
  // import vuetify from 'vuetify'

  // Components
  import ForecastCard from './ForecastCardV.vue'

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
    },
    props: {
      baseLayer: {
        type: String,
        default: 'openstreetmap',
      },
    },
    // mounted() {
    //   console.log('Width: ', this.$vuetify.breakpoint.width)
    // },
    setup(props) {
      // const { mobile, xs } = useDisplay()
      const mobile = ref(false)
      const xs = ref(false)


      // Productions Zones
      // Geojson:
      //  EPSG:4326 equivale a WGS84 => L.CRS.EPSG4326 (Default) (LNG-LAT)
      //  EPSG 3857 google Earth
      // const productionZoneList = { type: "FeatureCollection", features: zoneListArousa.features }; // Geojson is LonLat coordinates
      const productionZones = ref(zoneListArousa.features)

      // Set up x/y box boundary for map
      //  -9.313264264027785, 42.16707798644801, -8.488283058107688, 42.884309902262885
      //  Left-top: 42.65416193033991, -87.87676334381104
      //  Right-bottom: 42.637652611643716, -87.8353500366211
      //  Center: 42.64608415262391, -87.85539794400394
      const centerBound = { lat: 42.51994, lng: -8.93902}; // L.latLng(42.51994, -8.93902);
      //const firstBound = L.latLng(42.16707798644801, -9.313264264027785);
      //const secondBound = L.latLng(42.884309902262885, -8.488283058107688);

      // Coordinate conversion:
      //  Normal:   { lat: 42.51994, lng: -8.93902 } => [42.51994, -8.93902]
      //  Reverso:  { lat: 42.51994, lng: -8.93902 } => [-8.93902, 42.51994] Use in EPSG:4326
      // eslint-disable-next-line no-unused-vars
      const convert2Coordinate = (latLng) => {
        return [latLng.lat, latLng.lng]
      }
      const convert2CoordinateReverse = (latLng) => {
        return [latLng.lng, latLng.lat]
      }


      // Map
      const view = ref(null)
      const map = ref(null)

      const mapProjection = ref('EPSG:4326') // EPSG:3857 - Proyección WGS84 / Pseudo-Mercator
      const mapCenter = ref(convert2CoordinateReverse(centerBound))
      const mapZoom = ref(12.5)
      const mapRotation = ref(0)

      const currentZoom = ref(mapZoom.value)
      const currentCenter = ref(mapCenter.value)


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
      // productionZones.value = (new GeoJSON()).readFeatures(productionZoneList)
      // productionZones.value = geoJsonFormat.readFeatures(productionZoneList)

      // TODO - Se sustituye por styleFuncFactory
      const overrideStyleFunction = (feature, style) => {
        debugger
        const properties = feature.getProperties()
        if (properties?.data?.forecast) {
          style = getForecastStyle(properties?.data?.forecast)
          feature.setStyle(style)
        }
      }
      const styleFuncFactory = () => {
         // cache to allow styles reusing for features with same state
        // let cache = {}
         // pre build some shared styles
        //  let blueStroke = new Stroke({color: "blue"})

         const defaultStyle = [
            createStyle({
              strokeColor: 'blue',
              strokeWidth: 3,
              fillColor: [255, 255, 255, 0.1], // // rgba(255,255,255,0.1)
            }),
          ]

          // feature - ol.Feature instance
          // resolution - current view resolution as float
          // eslint-disable-next-line no-unused-vars
          return (feature, resolution) => {
            const properties = feature.getProperties()
            if (properties?.data?.forecast) {
              return [getForecastStyle(properties?.data?.forecast)]
            }
            return defaultStyle
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
          showForecast(null)
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

      const selectedPMPosition = ref([])
      const selectedPM = ref(null)
      // const selectConditionPointerMove = selectConditions.pointerMove;
      const selectConditionPointerMove = pointerMove;
      const featureSelectedPointerMove = (event) => {
        selectedPM.value = null
        selectedPMPosition.value = []

        // Si hay algo seleccionado
        // if (event?.selected && event?.selected.length > 0) {
        if (event.type === 'select' && event?.feature) {
          // selectedPMPosition.value = extent.getCenter(event.selected[0].getGeometry().extent_)
          selectedPMPosition.value = getCenter(event.feature.getGeometry().extent_)

          const properties = event.feature.getProperties()
          if (properties?.data?.forecast) {
            selectedPM.value = {
              name: event.feature.values_.name,
              forecast: properties?.data?.forecast
            }
          }
        }
      }

      // Todas las Features con data
      const selectInteactionFilter = (feature) => {
        return feature.values_.data != undefined;
      }
      // <<<

      // zoomUpdate: updates a data property with the current zoom level dynamically
      // also changes the visibility of building or room labels based on zoom level
      const mapZoomUpdate = (zoom) => {
        currentZoom.value = zoom;
      }

      // centerUpdate: updates the currentCenter value with the center if it has changed
      const mapCenterUpdate = (center) => {
        currentCenter.value = center;
      }

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
        currentCenter.value = coordinate
        goToSpot(coordinate)
      }

      // Forecast
      const loading = ref(false)

      const overWriteForecastData = ( forecast ) => {
        const pmId = forecast.forecastItemHeader.forecastHeader.pm.id
        const pmName = forecast.forecastItemHeader.forecastHeader.pm.poligono

        // Method 1:
        // for (let i = 0; i < productionZones.value.length; i++) {

        //   // Asignar el forecast al polígono
        //   const properties = productionZones.value[i].getProperties()
        //   if (properties?.id === pmId) {
        //     properties.data = forecast
        //     break;
        //   }
        // }

        // Method 2:
        productionZones.value = productionZones.value.map( (feature) => {
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

      const onLoadForecast = () => {
        loading.value = true;
        axios
          // .get('http://localhost:8050/public/forecast?pmId=1&dateRef=1-08-2022')
          // .get('http://localhost:8050/public/forecast?riaId=5&dateRef=1-08-2022')
          .get(`${API_BASE}/public/forecast?riaId=5&dateRef=1-08-2022`)
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
      onLoadForecast()

      // Forecast
      const getForecastStyle = (forecast) => {
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
          width: 3,
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
        loading,

        // Map
        map,
        view,
        mapProjection,
        mapRotation,
        mapCenter,
        mapZoom,
        // Map functions
        mapZoomUpdate,
        mapCenterUpdate,
        goMapHome,
        goProductionZone,

        // Tile Layer
        tileLayerOptions, // All tile layers in object(id, url, attibuttion)
        tileLayerSelected,
        onBaseLayerChange, // Parent control (No sería necesario porque ya tenemos watch)

        // Vector layer
        productionZones, // GeoJSON data
        geoJsonFormat,
        overrideStyleFunction,
        styleFuncFactory, // TODO

        // Circle with the last search PM (ProductionZones)
        layerSelectedPoint,

        // MouseMove: Forecast PopUp
        selectedPMPosition,
        selectedPM,
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
