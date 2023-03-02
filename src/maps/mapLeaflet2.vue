l<template>
  <div>
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
          <v-btn
            class="my-1"
            x-small
            fab
            :color="'grey'"
            @click="onMapZoomControl(-1)"
          >
            <ChartBarGauge ref="chartBarGaugeRef" style="max-width: 32px;"></ChartBarGauge>
          </v-btn>
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
      <div class="data-ref-wrapper" :class="[ $vuetify.breakpoint.xs ? 'data-ref-wrapper-bottom' : 'data-ref-wrapper-top' ]">
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
          attributionControl: false,
          // zoomSnap: true
          // zoomSnap: 0.25,
        }">

        <l-tile-layer :url="tileLayerSelected.url" :options="{ maxNativeZoom:19, maxZoom:21, minZoom:6 }"></l-tile-layer>
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
  import { onMounted, ref, watch } from 'vue';
  import axios from 'axios';

  // Leaflet
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import { LMap, LTileLayer, LGeoJson, LLayerGroup, LMarker, LTooltip, LCircleMarker } from 'vue2-leaflet'; // Import vue leaflet

  // GeoJSON Files (Import before undate from API)
  //  Ojo que las coordendas en un Geojson se indican LonLat
  import geojsonDataPOL from '../geojson/POL.json'; // Import vectorLayerGeojsonPOL GeoJSON (LonLat)
  import geojsonDataPMI from '../geojson/PMI.json'; // Import vectorLayerGeojsonPMI GeoJSON (LonLat)

  // DateRef + MapCenter + MapZoom + MapRotation
  import useMap from '@/service/useMap';
  import useUtilsMap from '@/service/useUtilsMap';
  import useForecastLeafLet from '@/service/useForecastLeafLet';

  // Components
  import ForecastCard from '../components/ForecastCardV.vue'
  import ForecastToxinType from '../components/ForecastToxinType.vue';
  import ForecastTable from '@/components/ForecastTable.vue';
  import SidebarPOL from '@/components/SidebarPOL.vue';
  import MapBaseLayer from '@/components/MapBaseLayer.vue';
  import ChartBarGauge from '@/components/ChartBarGauge.vue'

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
      ChartBarGauge,
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
      // debugger
      const onPointToLayer = (feature, latlng) => {
        return new L.Circle(latlng, 250, getPMIStyle(feature));
        // return L.marker(latlng)
        // if (feature.properties.radius) {
        // } else {
        //   return new L.Marker(latlng);
        // }
      }

      const onPointToLayerIcon = (feature, latlng) => {
        return L.marker(latlng, { icon: arrow }).addTo(map.value.mapObject)
      }


      const chartBarGaugeRef = ref(null)

      const setupLeafletMap = () => {

        // map.value.addEventListener('click', onFeatureClick, false) // Este click se define en onEachFeature
        // map.value.on("zoom", onMapZoomUpdate)
        // map.value.on("rotate", onMapRotationUpdate)
        // map.value.on('moveend', () => {
        //   const center = map.value.mapObject.getCenter();
        //   onMapCenterUpdate([center.lat, center.lng])
        // });

        // debugger
        // L.marker(mapCenter.value, { icon: arrow }).addTo(map.value.mapObject);
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

