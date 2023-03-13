<template>
  <div>

    <!-- Render all icons -->
    <div ref="chartBarGaugeRef" class="d-flex w-100" v-if="showLayerPOL">
      <!-- <ChartBarGauge
        v-for="(feature, index) in vectorLayerGeojsonPOLForecast"
        :key="index"
        :id="feature.properties.name"
        :forecast="feature.properties.data.forecast"
        style="max-width: 32px;"
      >
      </ChartBarGauge> -->
      <!-- v-if="showLayerPOL" -->
      <!-- :geojson="vectorLayerGeojsonPOL" -->
    </div>
    <!-- {{ chartRenderizado }} -->
    <!-- <div class="d-flex w-100" v-if="forecastDefault">
      <ChartBarGauge :forecast="forecastDefault" style="max-width: 132px;"></ChartBarGauge>
    </div> -->

    <SidebarPOL class="sidebar_pol" :isSidebarActive.sync="isPOLOpen"></SidebarPOL>

    <div class="map_container_wrapper" :class="[isPOLOpen ? 'one_sidebar_after' : 'none_sidebar_after']">

      <div class="map_controls">
        <div class="d-flex flex-column">
          <MapBaseLayer class="my-1" :baseLayer.sync="baseLayerLocal"></MapBaseLayer>
          <v-btn
            class="my-1"
            x-small
            fab
            :color="'grey'"
            @click="onMapZoomControl(1)"
          >
            <v-icon color="white">mdi-plus</v-icon>
          </v-btn>
          <v-btn
            class="my-1"
            x-small
            fab
            :color="'grey'"
            @click="onMapZoomControl(-1)"
          >
            <v-icon color="white">mdi-minus</v-icon>
          </v-btn>
          <!-- <v-btn
            class="my-1"
            x-small
            fab
            :color="'grey'"
            @click="onMapZoomControl(-1)"
          >
            <ChartBarGauge ref="chartBarGaugeRef" style="max-width: 32px;"></ChartBarGauge>
            <ChartBarGauge ref="chartBarGaugeRefRC" style="max-width: 32px;"></ChartBarGauge>
          </v-btn> -->
        </div>
      </div>

      <div class="map_extra_tools">
        <div class="d-flex flex-column">

          <!-- Toxin type  -->
          <forecast-toxin-type
            class="my-1"
            :toxin-type-selected.sync="toxinTypeSelected"
            :toxin-type-options="toxinTypeOptions"
            :loading="loading"
          />

          <!-- Toogle POL panel -->
          <v-btn
            class="my-1"
            x-small
            fab
            :color="isPOLOpen ? 'blue darken-2' : 'grey'"
            @click="isPOLOpen = !isPOLOpen"
          >
            <v-icon color="white">mdi-vector-polygon</v-icon>
          </v-btn>

          <!-- Tox/dTox table -->
          <v-dialog
            :return-value.sync="dateRef"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-on="on"
                v-bind="attrs"
                class="my-1"
                color="grey"
                x-small
                fab
              >
                <v-icon color="white">mdi-monitor-dashboard</v-icon>
              </v-btn>
            </template>
            <forecast-table></forecast-table>
          </v-dialog>
        </div>
      </div>

      <!-- Date: Prev + Date + Next [Mismo estilo que el toolbar]-->
      <!-- <div class="data-ref-wrapper" :class="[ $vuetify.breakpoint.xs ? 'data-ref-wrapper-bottom' : 'data-ref-wrapper-top' ]"> -->
      <div class="forecast-animation">
        <div class="d-flex align-center" style="height: 56px;">

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

          <!-- Play / Pause -->
          <v-btn
            :color="animationTimer ? 'secondary' : 'primary'"
            x-small
            depressed
            fab
            @click="startstop"
          >
            <v-icon>
              {{ animationTimer ? 'mdi-pause' : 'mdi-play' }}
            </v-icon>
          </v-btn>

          <!-- Slider -->
          <!-- :thumb-size="24" -->
          <v-slider
            class="mr-1"
            dense
            v-model="animationPosition"
            :min="animationPositionMin"
            :max="animationPositionMax"
            thumb-label="always"
            ticks="always"
            tick-size="4"
            hide-details="true"
            @change="(event) => onChangeAnimationPositionSlider(event)"
            @click="stop"
            @start="stop"
          >
            <template v-slot:thumb-label="{ value }">
              Day{{ value }}
            </template>
          </v-slider>

          <!-- Velocity -->
          <v-btn
            class="mr-1"
            color="secondary"
            x-small
            depressed
            @click="onChangeAnimationVelocity"
          >
            {{ animationVelocity }}x
          </v-btn>
        </div>
      </div>

      <!-- ForecastSelected -->
      <!-- :class="{ 'overlay-forecast-wrapper-mobile' : $vuetify.breakpoint.xs || !forecastMinimize }" -->
      <div
        v-if="forecastSelected"
        class="overlay-forecast-wrapper"
        :class="{ 'overlay-forecast-wrapper-mobile' : !forecastMinimize }"
      >

        <!-- Imagen Superior: Rana del tiempo -->
        <div
          v-if="$vuetify.breakpoint.xs || !forecastMinimize"
          :style="{
            'background-image':'url(assets/forecast_beach.jpeg)',
            'height': '130px',
            'background-size': 'cover',
            'background-position-y': 'center'
          }"></div>

        <ForecastCard
          :forecast="forecastSelected"
          :minimize="forecastMinimize"
          @update:minimize="(value) => forecastMinimize = value"
          @close="() => forecastSelected = null">
        </ForecastCard>
      </div>

      <div id="info_container"></div>

      <!-- Leaflet Map -->
      <!-- <div id="map"></div> -->
      <!-- :zoomAnimation="true" -->
      <l-map
        id="map"
        ref="map"
        :zoom.sync="mapZoom"
        :center.sync="mapCenter"
        :options="{
          zoomControl: false,
          // attributionControl: false,
          // zoomSnap: true
          // zoomSnap: 0.25,
        }">

        <l-tile-layer :url="tileLayerSelected.url" :options="{ maxNativeZoom:19, maxZoom:21, minZoom:4 }"></l-tile-layer>
        <!-- <ChartBarGauge></ChartBarGauge> -->

        <!-- <l-marker
          :lat-lng="mapCenter"
        >
          <ChartBarGauge style="max-width: 32px;"></ChartBarGauge>
        </l-marker> -->

        <l-layer-group>
          <l-circle-marker
            v-if="layerSelectedPoint"
            :lat-lng="layerSelectedPoint"
            :radius="2"
          />

          <l-geo-json
            v-if="showLayerPOL"
            :geojson="vectorLayerGeojsonPOL"
            :options="{ style: getGeojsonStylePOL, onEachFeature: onEachFeaturePOL }"
          ></l-geo-json>

          <l-geo-json
            v-if="showLayerPMI"
            :geojson="vectorLayerGeojsonPMI"
            :options="{ pointToLayer: onPointToLayer }"
          ></l-geo-json>

          <l-geo-json
            v-if="showLayerPMI"
            :geojson="vectorLayerGeojsonPMI"
            :options="{ pointToLayer: onPointToLayerIcon }"
          ></l-geo-json>
        </l-layer-group>
      </l-map>

    </div>
  </div>
</template>

<script>
  import { computed, onMounted, ref, watch } from 'vue';
  import axios from 'axios';

  // Leaflet
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";

  // Importamos los plugings
  // import "../plugins/leaflet/MiniChart"
  // import "leaflet-rain"
  import "../plugins/leaflet/RainViewer/RainViewer.js"
  import "../plugins/leaflet/RainViewer/RainViewer.css"

  // import "leaflet-particles" // Like windy particles
  import "leaflet-particles/src/js/L.ParticlesLayer" // Like windy particles

  import "../plugins/leaflet/Velocity/leaflet-velocity.css"
  import "../plugins/leaflet/Velocity/leaflet-velocity.js"
  // import "../plugins/leaflet/Velocity/src/css/leaflet-velocity.css"
  // import "../plugins/leaflet/Velocity/src/js/windy.js"
  // import "../plugins/leaflet/Velocity/src/js/L.CanvasLayer.js"
  // import "../plugins/leaflet/Velocity/src/js/L.VelocityLayer.js"

  import "../plugins/leaflet/leaflet-heat"
  // import "http://leaflet.github.io/Leaflet.markercluster/example/realworld.10000.js"
  // import { addressPoints } from '../geojson/Heat/HeatPoints'; // Import vectorLayerGeojsonPMI GeoJSON (LonLat)

  // import "../plugins/leaflet/Heatmap/heatmap"
  import "../plugins/leaflet/Heatmap/leaflet-heatmap"

  // Time Dimensaion
  // import "../plugins/leaflet/TimeDimension/iso8601.min"
  // import "../plugins/leaflet/TimeDimension/dist/leaflet.timedimension.control.css"
  // import "../plugins/leaflet/TimeDimension/dist/leaflet.timedimension.src.js"

  // NetCDF REad
  // import { readFileSync } from 'fs'
  // import { NetCDFReader } from 'netcdfjs'


  import { LMap, LTileLayer, LGeoJson, LLayerGroup, LMarker, LTooltip, LCircleMarker } from 'vue2-leaflet'; // Import vue leaflet

  // GeoJSON Files (Import before undate from API)
  //  Ojo que las coordendas en un Geojson se indican LonLat
  import geojsonDataPOL from '../geojson/POL.json'; // Import vectorLayerGeojsonPOL GeoJSON (LonLat)
  import geojsonDataPMI from '../geojson/PMI.json'; // Import vectorLayerGeojsonPMI GeoJSON (LonLat)

  // Import
  import geojsonDataTest from '../geojson/Velocity/test.json'; // Import vectorLayerGeojsonPMI GeoJSON (LonLat)
  import geojsonDataWindGlobal from '../geojson/Velocity/wind-global.json'; // Import vectorLayerGeojsonPMI GeoJSON (LonLat)
  import geojsonDataWindGBR from '../geojson/Velocity/wind-gbr'; // Import vectorLayerGeojsonPMI GeoJSON (LonLat)
  import geojsonDataWaterGBR from '../geojson/Velocity/water-gbr'; // Import vectorLayerGeojsonPMI GeoJSON (LonLat)

  // DateRef + MapCenter + MapZoom + MapRotation
  import useMap from '@/service/useMap';
  import useUtilsMap from '@/service/useUtilsMap';
  import useForecastLeafLet from '@/service/useForecastLeafLet';

  import useTimeMap from './useTimeMap';

  // Components
  import ForecastCard from '../components/ForecastCardV.vue'
  import ForecastToxinType from '../components/ForecastToxinType.vue';
  import ForecastTable from '@/components/ForecastTable.vue';
  import SidebarPOL from '@/components/SidebarPOL.vue';
  import MapBaseLayer from '@/components/MapBaseLayer.vue';
  // import ChartBarGauge from '@/components/ChartBarGauge.vue'

  // URL connection
  const API_BASE = process.env.VUE_APP_API_BASE

  export default {
    name: "map-component",
    components: {
      LMap,
      LTileLayer,
      LGeoJson,
      LLayerGroup,
      // eslint-disable-next-line vue/no-unused-components
      LMarker,
      LCircleMarker,
      // eslint-disable-next-line vue/no-unused-components
      LTooltip,
      ForecastCard,
      ForecastToxinType,
      ForecastTable,
      SidebarPOL,
      MapBaseLayer,
      // ChartBarGauge,
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

      /** TimeMap */
      const {
        animationPosition, animationPositionMin, animationPositionMax, onChangeAnimationPositionSlider,
        onAdd,
        startstop, animationTimer, stop,
        animationVelocity, onChangeAnimationVelocity,
      } = useTimeMap()

      /** --- ToxinType --- */
      // ToxinType
      const toxinTypeOptions = [
        { value: 'DSP', text: 'LIPO', color: 'blue', image: ''},
        { value: 'ASP', text: 'ASP', color: 'orange', image: ''},
        { value: 'PSP', text: 'PSP', color: 'green', image: ''},
      ];
      const toxinTypeSelected = ref(toxinTypeOptions.find(item => item.value === (localStorage.getItem('toxinType') || 'DSP')));

      /** --- DateRef --- */
      const {
        dateRef,
        dateRefFormatted,
        setLastDateRefUsed
      } = useMap()

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

      // Productions Zones
      // Geojson:
      //  EPSG:4326 equivale a WGS84 => L.CRS.EPSG4326 (Default) (LNG-LAT)
      //  EPSG 3857 google Earth
      const vectorLayerGeojsonPOL = ref(geojsonDataPOL.features)
      const vectorLayerGeojsonPMI = ref(geojsonDataPMI.features)
      const vectorLayerGeojsonPOLForecast = computed( () => {
        return vectorLayerGeojsonPOL.value.filter((feature) => {
          if (feature?.properties?.data?.forecast !== undefined) {
            return true
          }
          return false
        }
        )
      })

      // Map (With LeafLet no se puede cambiar mapProjection)
      const map = ref(null)
      const { mapCenter, mapZoom } = useMap()


      // >>> Base layer selection: Ojo que se puede cambiar en 2 sitios (Gestionar)
      const { tileLayerOptions } = useMap()
      const baseLayerLocal = ref(JSON.parse(JSON.stringify(props.baseLayer)))
      const tileLayerSelected = ref(null) // { id, url, attibutions }

      // props passed to setup function is reactive object (made probably by reactive()), it's properties are getters.
      // Watching a getter: https://v3.vuejs.org/api/computed-watch-api.html#watching-a-single-source
      watch(() => props.baseLayer, () => {
        baseLayerLocal.value = JSON.parse(JSON.stringify(props.baseLayer))

        onBaseLayerChange(baseLayerLocal.value)
      })
      watch(() => baseLayerLocal.value, () => {
        onBaseLayerChange(baseLayerLocal.value)
      })

      // Change base layer
      const onBaseLayerChange = (baseLayer = 'openstreetmap') => {
        tileLayerSelected.value = tileLayerOptions.find(item => item.id === baseLayer)
      }
      onBaseLayerChange(baseLayerLocal.value)
      // <<<

      // >>> Events
      const forecastSelected = ref(null)
      const forecastMinimize = ref(true)
      const showForecast = (forecast) => {
        forecastSelected.value = forecast;
      }

      // On click feature
      const onFeatureClick = (feature) => {
        if (feature) {
          showForecast(feature?.properties?.data?.forecast)

          // Indicamos la coordenada donde mostraremos un círculo (Vers tags arriba)
          if (feature?.geometry?.coordinates) {
            layerSelectedPoint.value = reverseCoord(getCenterCoordinateOfPoligone(feature.geometry.coordinates))
          }
        } else {
          if (forecastMinimize.value) {
            showForecast(null)
          }
        }
      }

      const onMapZoomControl = (zoomDelta) => {
        const newZoom = map.value.mapObject.getZoom() + zoomDelta
        map.value.mapObject.flyTo(mapCenter.value, newZoom, {
          animate: true,
          duration: 1.5
        });
      }


      /* --- Map --- */
      // eslint-disable-next-line no-unused-vars
      var arrow = L.divIcon({
        html: '<div class="arrow"><span></span><span></span><span></span></div>',
        iconSize: [50, 50],
        className: 'my-arrow'
      });
      // const chartBarGaugeRef = ref(null)

      // Forecast
      const {
        getForecastStyle,
        featureHoverStyle,
        getPMIStyle,
      } = useForecastLeafLet()

      const getGeojsonStylePOL = (feature) => {
        return getForecastStyle(feature?.properties?.data?.forecast)
      }

      const onEachFeaturePOL = (feature, layer) => {
        var clicked = false

        // let points = [[latlngs], [latlngs], ...],
        // const options = {
        //   angle: 80,
        //   width: 1,
        //   spacing: 10,
        //   length: 4,
        //   interval: 10,
        //   speed: 1,
        //   color: 'Oxa6b3e9'
        // }
        // const rain = L.rain(feature.geometry.coordinates, options)
        // rain.addTo(map.value.mapObject)

        layer.on('click', (event) => {
          console.log(event)
          clicked = !clicked

          // if (clicked) {
          layer.setStyle(getForecastStyle(feature?.properties?.data?.forecast));

          // Set forecast selected
          onFeatureClick(feature)
        });

        // Change polygon style on mouseover event
        layer.on('mouseover', (event) => {
          console.log(event)
          layer.setStyle(featureHoverStyle);
        });
        layer.on('mouseout', (event) => {
          console.log(event)
          layer.setStyle(getForecastStyle(event?.target?.feature?.properties?.data?.forecast));
        });
      }

      // PMI
      const onPointToLayer = (feature, latlng) => {
        return new L.Circle(latlng, 250, getPMIStyle(feature));
        // return L.marker(latlng)
        // if (feature.properties.radius) {
        // } else {
        //   return new L.Marker(latlng);
        // }
      }


      // debugger
      const forecastDefault = vectorLayerGeojsonPOL.value.find( (element) => element?.properties?.name === 'Ribeira B')
      // const chartRenderizado = h(ChartBarGauge, { forecast: forecastDefault })
      // eslint-disable-next-line no-unused-vars
      const onPointToLayerIcon = (feature, latlng) => {
        // if (chartBarGaugeRef.value && chartBarGaugeRef.value.children.length > 0) {
        //   const gaugeIcon = L.divIcon({
        //     html: chartBarGaugeRef.value.children[0].__vue__.$el,
        //     iconSize: [32, 32],
        //     className: 'my-arrow--'
        //   });
        //   return L.marker(latlng, { icon: gaugeIcon }).addTo(map.value.mapObject)
        // }
        // if (feature.properties.name === 'A0') {
        //   const gaugeIcon = L.divIcon({
        //     html: chartBarGaugeRef.value.$el,
        //     iconSize: [32, 32],
        //     className: 'my-arrow--'
        //   });
        //   return L.marker(latlng, { icon: gaugeIcon }).addTo(map.value.mapObject)
        // }
        // if (feature.properties.name === 'A1') {
        //   const gaugeIcon = L.divIcon({
        //     html: chartBarGaugeRefRC.value.$el,
        //     iconSize: [32, 32],
        //     className: 'my-arrow--'
        //   });
        //   return L.marker(latlng, { icon: gaugeIcon }).addTo(map.value.mapObject)
        // }
        // return

        // const vnode = h('div', { id: 'foo' }, [])
        // const vnode = h('span', 'hello')
        // // const render = h(ChartBarGauge, { forecast: forecastDefault })
        // const gaugeIcon = L.divIcon({
        //   html: vnode,
        //   iconSize: [32, 32],
        //   className: 'my-arrow--'
        // });
        // return L.marker(latlng, { icon: gaugeIcon }).addTo(map.value.mapObject)

        // return L.minichart(latlng, { data: [Math.random(), Math.random(), Math.random()] });
        // return L.Marker(latlng, { icon: L.DivIcon.SVGIcon() })
        // return L.marker.svgMarker(latlng)
        // return L.Marker.SVGMarker(latlng, options)

        // debugger
        // L.marker(latlng, { icon: arrow }).addTo(map.value.mapObject);
        // L.marker(mapCenter.value, { icon: gaugeIcon }).addTo(map.value.mapObject);
      }

      // debugger
      const chartBarGaugeRef = ref(null)
      const chartBarGaugeRefRC = ref(null)

      // eslint-disable-next-line no-unused-vars
      const readDensity = (index) => {
        console.log(index)
        // debugger

        // fetch('http://leaflet.github.io/Leaflet.markercluster/example/realworld.10000.js')
        // fetch('/data/test.json')
        fetch('/data/particles/particles_2017-07-10T00.json')
          .then(response => response.text())
          .then(data => {
            // debugger
            if (data) {
              data = JSON.parse(data)
              // setNCDensity(JSON.parse(data))
              // const msl = { min: 10000, max: 0, data: [] };
              // for (let i = 0; i < data.length; i++) {
              //   msl.data.push({'lat': data[i][0], 'lng': data[i][1], 'value': data[i][2]});
              //   if (data[i][2] > msl.max) {
              //     msl.max = data[i][2]
              //   }
              //   if (data[i][2] < msl.min) {
              //     msl.min = data[i][2]
              //   }
              // }
              // setNCDensity(msl)

              const addressPoints2 = data.map((p) => { return [p[0], p[1]] });
              heatLayer.setLatLngs(addressPoints2)
            }
          }
          )
          .catch(error => console.error(error))
      }

      // const setNCDensity = (values) => {
      //   L.heatLayer(values).addTo(map.value.mapObject);
      // }

      var heatLayer = null
      const leafletHeatmap = () => {

        // debugger
        // heatLayer = L.heatLayer([], {radius: 4, blur:1 }).addTo(map.value.mapObject);
        heatLayer = L.heatLayer([], {radius: 4, blur:1 })

        // L.TimeDimension.Layer
        // var anyLayer = L.timeDimension.layer(
        //   heatLayer,
        //   {
        //     timeDimension: true,
        //     timeDimensionOptions: {
        //       timeInterval: "2014-09-30/2014-10-30",
        //       period: "PT1H"
        //     },
        //     timeDimensionControl: true
        //   })
        // anyLayer.addTo(map.value.mapObject);

        readDensity(0)
      }

      // eslint-disable-next-line no-unused-vars
      const leafletTimeDimension = () => {
        // Create and add a TimeDimension Layer to the map
        // var tdWmsLayer = L.timeDimension.layer.wms(wmsLayer);
        // tdWmsLayer.addTo(map);

      }

      // eslint-disable-next-line no-unused-vars
      const leafletHeat = () => {
        // debugger
        // const addressPoints2 = addressPoints.map(function (p) { return [p[0], p[1]]; });
        // L.heatLayer(addressPoints2).addTo(map.value.mapObject);
      }

      // eslint-disable-next-line no-unused-vars
      const leatletVelocity = () => {

        debugger
        var testLayer = L.velocityLayer({
          displayValues: true,
          displayOptions: {
            velocityType: "Test",
            position: "bottomleft",
            emptyString: "No wind data"
          },
          data: geojsonDataTest,
          maxVelocity: 15
        });

        // $.getJSON("wind-global.json", function(data) {
        var windLayer = L.velocityLayer({
          displayValues: true,
          displayOptions: {
            velocityType: "Global Wind",
            position: "bottomleft",
            emptyString: "No wind data"
          },
          data: geojsonDataWindGlobal,
          maxVelocity: 15
        });

        var windGBRLayer = L.velocityLayer({
          displayValues: true,
          displayOptions: {
            velocityType: "GBR Wind",
            position: "bottomleft",
            emptyString: "No wind data",
            showCardinal: true
          },
          data: geojsonDataWindGBR,
          maxVelocity: 10
        });

        var waterGBRLayer = L.velocityLayer({
          displayValues: true,
          displayOptions: {
            velocityType: "GBR Water",
            position: "bottomleft",
            emptyString: "No water data"
          },
          data: geojsonDataWaterGBR,
          maxVelocity: 0.6,
          velocityScale: 0.1 // arbitrary default 0.005
        });

        const layerControl = L.control.layers({}, {
          test: testLayer,
          wind: windLayer,
          windGBR: windGBRLayer,
          waterGBR: waterGBRLayer,
        });
        layerControl.addTo(map.value.mapObject);
        // map.value.mapObject.addLayer(velocityLayer)
      }

      // eslint-disable-next-line no-unused-vars
      const leafletParticle = () => {
        // debugger
        // eslint-disable-next-line no-unused-vars
        const index = 0

        // { lat: 42.51994, lng: -8.93902 }
        const data = {
          "2023-03-03T18:00:00.000Z": [
            [
              6,        // particle id
              -8.93902, // lon
              42.51994, // lat
              0.5,      // depth (m)
              1.0       // age
            ],
          ]
        }

        // create a particle layer
        const mode = 'FINAL';
        const particleLayer = L.particlesLayer({

          // an array of keyframes, default: null
          data: data,

          pane: 'overlayPane', // name of an existing leaflet pane to add the layer to, default: 'overlayPane'

          // define the indices of your data point arrays, default:
          dataFormat: {
            idIndex:    0,
            lonIndex:   1,
            latIndex:   2,
            depthIndex: 3,
            ageIndex:   4
          },

          // one of: 'FINAL', 'EXPOSURE', 'KEYFRAME', default: null
          displayMode: mode,

          // which keyframe should display on init, default: 0
          startFrameIndex: 0,

          // the colors to use in chroma-js scale, default: (shown below)
          ageColorScale: ['green', 'yellow', 'red'],

          // the domain to fit the ageColorScale, default: keyframe length
          ageDomain: [0, 100],

          // heatmap.js options for heatmap layers, see:
          // https://www.patrick-wied.at/static/heatmapjs/example-heatmap-leaflet.html
          // note that additionally; we have an enhanced version of the leaflet-heatmap.js plugin (see /src)
          // that provides advanced cell/radius options, see: https://github.com/danwild/leaflet-heatbin
          heatOptions: {

            // example fixed radius of 1000m
            fixedRadius: true,
            radiusMeters: 1000,

            // e.g. bin values into 250m grid cells
            heatBin: {
              enabled: true,
              cellSizeKm: 0.25
            }
          },

          // the intensity value to use for each point on the heatmap, default: 1
          // only used if not heatBin.enabled
          exposureIntensity: 1,
          finalIntensity: 1,

          // callbacks when layer is added/removed from map
          onAdd: () => {},
          onRemove: () => {}
        });

        // add the layer to overlay control
        // const layerControl = L.control.layers({}, { particles: particleLayer });
        // layerControl.addTo(map.value.mapObject);

        // Activar directamente
        map.value.mapObject.addLayer(particleLayer)

        // data and display mode can be updated like:
        // debugger
        particleLayer.setData(data)
        particleLayer.setDisplayMode('KEYFRAME')

        // when in keyframe mode, set active frame like:
        particleLayer.setFrameIndex(index)
      }

      // eslint-disable-next-line no-unused-vars
      const rainWieverControl = () => {
        // Rain
        var rainviewer = L.control.rainviewer({
          position: 'topleft',
          nextButtonText: '>',
          playStopButtonText: 'Start/Stop',
          prevButtonText: '<',
          positionSliderLabelText: "Time:",
          opacitySliderLabelText: "Opacity:",
          animationInterval: 500,
          opacity: 0.5
        });
        rainviewer.addTo(map.value.mapObject);
      }

      // eslint-disable-next-line no-unused-vars
      const rainWieverFija = () => {
        // https://tilecache.rainviewer.com/v2/radar/1677846600/512/10/485/378/4/1_1.png
        // https://tilecache.rainviewer.com/v2/radar/1677847200/512/11/972/758/4/1_1.png
        // https://tilecache.rainviewer.com/v2/radar/1677846600/512/12/972/758/4/1_1.png

        // https://tilecache.rainviewer.com/v2/radar/1677847200/256/11/972/758/2/1_1.png
        const ts = 1677847200
        const rainLayer = new L.TileLayer(`https://tilecache.rainviewer.com/v2/radar/${ts}/256/{z}/{x}/{y}/2/1_1.png`, {
          tileSize: 256,
          opacity: 1,
          transparent: false,
          attribution: '<a href="https://rainviewer.com" target="_blank">rainnviewer.com</a>',
          zIndex: ts
        })
        map.value.mapObject.addLayer(rainLayer)
      }
      const setupLeafletMap = () => {

        // map.value.addEventListener('click', onFeatureClick, false) // Este click se define en onEachFeature
        // map.value.on("zoom", onMapZoomUpdate)
        // map.value.on("rotate", onMapRotationUpdate)
        // map.value.on('moveend', () => {
        //   const center = map.value.mapObject.getCenter();
        //   onMapCenterUpdate([center.lat, center.lng])
        // });

        // debugger
        L.marker(mapCenter.value, { icon: arrow }).addTo(map.value.mapObject);
        // loadGeojson()

        // debugger
        // var gaugeIcon = L.divIcon({
        //   html: chartBarGaugeRef.value.$el,
        //   iconSize: [32, 32],
        //   className: 'my-arrow'
        // });
        // debugger
        // L.marker(mapCenter.value, { icon: gaugeIcon }).addTo(map.value.mapObject);
        // vectorLayerGeojsonPOL.value.map( (feature) => {
        //   var coordinate = reverseCoord(getCenterCoordinateOfPoligone(feature.geometry.coordinates))
        //   if (coordinate) {
        //     L.marker(coordinate, { icon: arrow }).addTo(map.value.mapObject)
        //   }
        // })

        // var overlay = new L.echartsLayer3(map, echarts);


        // rainWieverControl()
        // rainWieverFija()
        leafletParticle()
        // leatletVelocity()
        leafletHeat()
        leafletHeatmap()

        // leafletTimeDimension()

        // debugger
        onAdd(map.value.mapObject)
      }

      onMounted( () => {
        setupLeafletMap()
      })

      // coordinate: [Lat, Lng]
      const goToSpot = (coordinate = [0, 0]) => {

        map.value.mapObject.flyTo(coordinate, 12.5, {
          animate: true,
          duration: 1.5
        });
      }
      // goMapHome: Pans back to the center of the map
      const goMapHome = () => {
        goToSpot(mapCenter.value)
      }

      // Called from the Home component when a room is searched,
      // this method handles changing the floor level, then pans and zooms to the desired location
      const layerSelectedPoint = ref(null)
      const { getCenterCoordinateOfPoligone, reverseCoord } = useUtilsMap()
      const goProductionZone = (pmName) => {
        const selectedPM = vectorLayerGeojsonPOL.value.find((feature) => (feature.properties.name === pmName))
        if (selectedPM) {
          if (selectedPM?.properties?.data?.forecast) {
            showForecast(selectedPM?.properties?.data?.forecast)
          }

          // Create a LatLng coordinate at the requested polygon (Ojo que los GeoJson usan LngLat)
          var coordinate = reverseCoord(getCenterCoordinateOfPoligone(selectedPM.geometry.coordinates))
          if (coordinate) {
            // Indicamos la coordenada donde mostraremos un círculo (Vers tags arriba)
            layerSelectedPoint.value = coordinate

            // Pan to the location of the coordinatex
            goToSpot(coordinate)
          }
        }
      }


      /* --- Forecast --- */
      const loading = ref(false)

      const overWriteForecastData = ( forecast ) => {
        const pmId = forecast.forecastItemHeader.forecastHeader.pm.id
        const pmName = forecast.forecastItemHeader.forecastHeader.pm.poligono

        // Method 2: Array map overwritte
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

        // .get('http://localhost:8050/public/forecast?pmId=1&dateRef=1-08-2022')
        // .get('http://localhost:8050/public/forecast?riaId=5&dateRef=1-08-2022')
        // .get(`${API_BASE}/public/forecast?riaId=5&dateRef=1-08-2022`)
        // const url = `${API_BASE}/public/forecast?riaId=5&dateRef=${dateRef.value}$toxinType=${toxinTypeSelected.value}`
        const params = {
          riaId: riaId,
          dateRef: dateRef.value || '',
          toxinType: toxinTypeSelected.value?.value || ''
        }
        var queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&');
        const url = `${API_BASE}/public/forecast?${queryString}`

        // debugger
        // loading.value = true;
        axios
          .get(url)
          .then(response => {
            console.log(response)
            if (response?.data?.forecasts) {
              response?.data.forecasts.map((forecast) => {
                overWriteForecastData(forecast)
                // updateFeature(forecast)
              })
            }
          })
          .catch(error => {
            console.error(error);
          })
          // .finally( () => {
          //   loading.value = false;
          // })
      }
      const loadForecastAll = (riaIds = [2,4,5,6]) => {
        loading.value = true;
        const tasks = riaIds.map(riaId => onLoadForecast(riaId))
        Promise.allSettled(tasks).then(() => {
          loading.value = false;
        })
      }
      loadForecastAll([2,4,5,6])

      // Toolbox options
      const isPOLOpen = ref(false)

      return {
        chartBarGaugeRef,
        chartBarGaugeRefRC,
        vectorLayerGeojsonPOLForecast,
        forecastDefault,
        // chartRenderizado,

        // Mapbox tools (Layer, Map zoom +/-)
        baseLayerLocal,
        onMapZoomControl, // Map zoom +/-

        // Toolbox options
        isPOLOpen,

        // ToxinType: [DSP, ASP, PSP]
        toxinTypeSelected,
        toxinTypeOptions,

        // DateRef
        dateRef,
        dateRefFormatted, // Computed DateRef with format

        // Map
        map,
        mapCenter,
        mapZoom,

        // Map external FM's
        goMapHome,
        goProductionZone,

        // Tile
        tileLayerSelected,

        // Geojson (POL)
        vectorLayerGeojsonPOL,
        getGeojsonStylePOL,
        onEachFeaturePOL,

        // Geojson (PMI)
        vectorLayerGeojsonPMI,
        onPointToLayer,
        onPointToLayerIcon,

        // Selected Point
        layerSelectedPoint,

        // Forecast
        loading,
        forecastSelected,
        forecastMinimize,

        // TimeMap
        // Slider
        animationPosition,
        animationPositionMin,
        animationPositionMax,
        onChangeAnimationPositionSlider,
        // Start-Stop toggle
        startstop,
        stop,
        animationTimer, // isPlay or isPause (Change icons)
        // Velocity
        animationVelocity,
        onChangeAnimationVelocity,
      }
    }
  }
</script>

<style lang="css" scoped>
  /* Full screen */
  .map_container_wrapper {
    /* float: left; */
    position: relative;
    height: 100vh;
  }
  .none_sidebar_after {
      width: 100%;
  }
  .one_sidebar_after {
      width: calc(100% - 280px);
  }

  /* Mapa */
  #map {
    /* float: left; */
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .map_extra_tools {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 3;
  }
  .map_controls {
    position: absolute;
    top: 50%;
    margin-top: -55px;
    left: 10px;
    z-index: 3;
  }

  .sidebar_pol {
    /* position: absolute;
    top: 0;
    right: 0; */
    z-index: 3;
  }

  /* ToxinType */
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

  /* DataRef Wrapper */
  .forecast-animation {
    background: none;
    z-index: 2;

    position: absolute;
    bottom: 0;
    left: 10px;

    width: 100%;
    padding: 10px;
  }

  /* DataRef Wrapper */
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

  /* Forecast */
  .overlay-forecast-wrapper{
    position: absolute;
    bottom: 0;
    max-width: 420px;
    z-index: 6;
    width: 100%;
  }

  .overlay-forecast-wrapper-mobile {
    height: 100%;
    background: white;
  }
</style>


<!-- Global scoped: Se insertan en el mapa -->
<style lang="css">

  .arrow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transform: rotate(90deg);
    cursor: pointer;
  }

  .arrow span {
    display: block;
    width: 1.5vw;
    height: 1.5vw;
    border-bottom: 5px solid white;
    border-right: 5px solid white;
    transform: rotate(45deg);
    margin: -10px;
    animation: animate 2s infinite;
  }

  .arrow span:nth-child(2) {
    animation-delay: -0.2s;
  }

  .arrow span:nth-child(3) {
    animation-delay: -0.4s;
  }

  @keyframes animate {
    0% {
      opacity: 0;
      transform: rotate(45deg) translate(-20px, -20px);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(45deg) translate(20px, 20px);
    }
  }
</style>

