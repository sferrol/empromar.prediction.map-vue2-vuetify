<template>
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

          <!-- Restamos 45º porque es la inclinación que trae el icono -->
          <v-btn
            v-if="mapRotation !== 0"
            class="my-3"
            :style="{transform: `rotate(${mapRotation - 45}deg)`}"
            x-small
            fab
            :color="'grey'"
            @click="onMapRotateReset"
          >
            <v-icon color="white">mdi-compass</v-icon>
          </v-btn>
          <!-- <v-btn
            class="my-1"
            x-small
            fab
            :color="'grey'"
            @click="onMapRotateControl(45)"
          >
            <v-icon color="white">mdi-sun-compass</v-icon>
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

      <!-- Toxin type -->
      <!-- <div class="toxin-type-wrapper" :class="[ $vuetify.breakpoint.xs ? 'toxin-type-wrapper-bottom' : 'toxin-type-wrapper-top' ]">
      <forecast-toxin-type
        :toxin-type-selected.sync="toxinTypeSelected"
        :toxin-type-options="toxinTypeOptions"
        :loading="loading"
      />
    </div> -->

      <!-- Date: Prev + Date + Next [Mismo estilo que el toolbar]-->
      <div class="data-ref-wrapper" :class="[ $vuetify.breakpoint.xs ? 'data-ref-wrapper-bottom' : 'data-ref-wrapper-top' ]">
        <div class="d-flex align-center" style="height: 56px;">
          <!-- <v-tooltip bottom>
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
        </v-tooltip> -->

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
        <!-- <v-tooltip bottom>
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
        </v-tooltip> -->
        </div>
      </div>

      <!-- ForecastSelected -->
      <div
        v-if="forecastSelected"
        class="overlay-forecast-wrapper"
        :class="{ 'overlay-forecast-wrapper-mobile' : $vuetify.breakpoint.xs || !forecastMinimize }"
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

      <!-- LeaveLet Map -->
      <div id="map"></div>
      <div id="info_container"></div>
    </div>
  </div>
</template>

<script>
  import { computed, onMounted, ref, watch } from 'vue';

  // Leaflet
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";

  // Importamos los plugings
  // import "leaflet.smoothzoom/L.Map.SmoothZoom"
  // import "../plugins/leaflet/SmoothZoom" // Zoom smooth as openlayers
  import "../plugins/leaflet/SmoothWheelZoom" // Zoom smooth as openlayers
  import "../plugins/leaflet/RotateDist"

  // GIS helpers
  import * as turf from '@turf/turf'; // Import turf for GIS functions
  import * as turfHelper from '@turf/helpers';  // Import turfHelper for GIS function helpers


  // GeoJSON File Imports
  //import zoneListArousa from '../geojson/POL_Interior_Arousa.json'; // Import vectorLayerGeojsonPOL GeoJSON (LonLat)
  import geojsonDataPOL from '../geojson/POL.json'; // Import vectorLayerGeojsonPOL GeoJSON (LonLat)
  import geojsonDataPMI from '../geojson/PMI.json'; // Import vectorLayerGeojsonPMI GeoJSON (LonLat)

  import useMap from '@/service/useMap';

  // Components
  import ForecastCard from '../components/ForecastCardV.vue'
  import ForecastToxinType from '../components/ForecastToxinType.vue';
  import ForecastTable from '@/components/ForecastTable.vue';
  import SidebarPOL from '@/components/SidebarPOL.vue';

  // DateRef
  import { format, parseISO, addDays, subDays } from 'date-fns'
  import { es } from 'date-fns/locale';
  import axios from 'axios';
  import MapBaseLayer from '@/components/MapBaseLayer.vue';

  // URL connection
  const API_BASE = process.env.VUE_APP_API_BASE

  export default {
    name: "map-component",
    components: {
      ForecastCard,
      ForecastToxinType,
      ForecastTable,
      SidebarPOL,
      MapBaseLayer,
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
      // const defaultMapCenter = [42.51994, -8.93902] // podría ser un objecto LatLon = { lat: 42.51994, lng: -8.93902 }
      // const defaultMapCenter = fromLonLat([-0.12755, 51.507222], 'EPSG:4326')  // Londres
      const defaultMapCenter = [42.51994, -8.93902] // Arousa
      const defaultMapZoom = 12.5
      const defaultMapRotation = 0

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
        // return localStorage.getItem('map-rotation') || 0
        let rotation = localStorage.getItem('map-rotation') // import number
        if (rotation) {
          rotation = JSON.parse(rotation)
        }
        return (typeof rotation === 'number') ? rotation : defaultMapRotation
      }
      const setUserMapRotation = (rotation) => {
        localStorage.setItem('map-rotation', rotation) // numeric
      }

      // Productions Zones
      // Geojson:
      //  EPSG:4326 equivale a WGS84 => L.CRS.EPSG4326 (Default) (LNG-LAT)
      //  EPSG 3857 google Earth
      // const productionZoneList = { type: "FeatureCollection", features: zoneListArousa.features }; // Geojson is LonLat coordinates
      const vectorLayerGeojsonPOL = ref(geojsonDataPOL.features)
      // eslint-disable-next-line no-unused-vars
      const vectorLayerGeojsonPMI = ref(geojsonDataPMI.features)

      // Map
      const map = ref(null)
      const view = ref(null)
      // eslint-disable-next-line no-unused-vars
      // const layerControl = ref(null)

      // const mapProjection = ref('EPSG:4326')    // EPSG:3857 - Proyección WGS84 / Pseudo-Mercator (Usa [Lng,Lat])
      const mapCenter = ref(getUserMapCenter()) // convert2CoordinateReverse() Trabajamos directamente con [Lng,Lat]
      const mapZoom = ref(getUserMapZoom())
      const mapRotation = ref(getUserMapRotation())


      // >>> Base layer selection
      const { tileLayerOptions } = useMap()

      // debugger
      const baseLayers = ['openstreetmap', 'mapbox', 'google-satellite-only'].map((key) => {
        const tileLayer = tileLayerOptions.find((element) => element.id === key);
        return L.tileLayer(tileLayer.url, {id: tileLayer.id, attribution: tileLayer.attribution});
      });
      // const baseMaps = baseLayers.reduce((acc,curr)=> (acc[curr]='',acc),{});
      // let baseMaps = []
      // baseMaps['openstreetmap'] = baseLayers.find((element) => element.options.id === 'openstreetmap')
      // baseMaps['mapbox'] = baseLayers.find((element) => element.options.id === 'mapbox')
      // baseMaps['google-satellite-only'] = baseLayers.find((element) => element.options.id === 'google-satellite-only')


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

        // Remove last (If map ready)
        if (tileLayerSelected.value) {
          const removeLayer = baseLayers.find((element) => element.options.id === tileLayerSelected.value.id)
          if (removeLayer && map.value) {
            map.value.removeLayer(removeLayer);
          }
        }
        tileLayerSelected.value = tileLayerOptions.find(item => item.id === baseLayer)

        // baseMaps[tileLayerSelected.value.id].addTo(map.value);
        if (tileLayerSelected.value) {
          const addLayer = baseLayers.find((element) => element.options.id === tileLayerSelected.value.id)
          if (addLayer && map.value) {
            map.value.addLayer(addLayer);
          }
        }
      }
      onBaseLayerChange(baseLayerLocal.value)
      // <<<

      // >>> Events
      const forecastSelected = ref(null)
      const forecastMinimize = ref(true)
      const showForecast = (forecast) => {
        forecastSelected.value = forecast;
      }

      // const selectedPMForecastPopUp = ref(null)

      // On click feature
      // eslint-disable-next-line no-unused-vars
      const onFeatureClick = (feature) => {
        // debugger
        // const pixel = event.pixel || [event.layerX, event.layerY]
        // var feature = await map.value.forEachFeatureAtPixel(pixel, function(feature) {
        //   return feature;
        // })
        if (feature) {
          // const properties = feature.getProperties()
          showForecast(feature?.properties?.data?.forecast)

          // Indicamos la coordenada donde mostraremos un círculo (Vers tags arriba)
          if (feature?.geometry?.coordinates) {
            layerSelectedPoint.value = getCenterCoordinateOfPoligone(feature.geometry.coordinates)
          }
        } else {
          if (forecastMinimize.value) {
            showForecast(null)
          }
        }
      }
      const onMapCenterUpdate = (center) => {
        mapCenter.value = center;
      }
      const onMapZoomUpdate = () => {
        mapZoom.value = map.value.getZoom()
      }
      const onMapRotationUpdate = () => {
        mapRotation.value = map.value.getBearing()
      }
      const onMapZoomControl = (zoomDelta) => {
        const newZoom = map.value.getZoom() + zoomDelta
        map.value.flyTo(mapCenter.value, newZoom, {
          animate: true,
          duration: 1.5
        });
      }
      const onMapRotateReset = () => {
        map.value.setBearing(0)
      }
      // Set rotation increment (Only test)
      const onMapRotateControl = (rotateDelta) => {
        mapRotation.value = map.value.getBearing() + rotateDelta

        map.value.setBearing(mapRotation.value)
      }


      /* --- Map --- */
      var arrow = L.divIcon({
        html: '<div class="arrow"><span></span><span></span><span></span></div>',
        iconSize: [50, 50],
        className: 'my-arrow'
      });

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
        return {
          fillColor: toxAForecastColor || '#3388ff',
          color: analisisColor || '#fff8eb',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8,
        }
      }
      const featureHoverStyle = {
        //fillColor: '#a7c5f8',
        //color: '#448aff',
        fillColor: '#bdcdc7',
        color: '#016836',
        weight: 2,
      }
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

          // selectedPMForecast.value = properties?.data?.forecast

          // selectedPMForecastPopUp.value = L.popup()
          //   .setLatLng(event.latlng)
          //   .setContent('<p>Hello world!<br />This is a nice popup.</p>')
          //   .openOn(map.value);
        });
        layer.on('mouseout', (event) => {
          console.log(event)
          layer.setStyle(getForecastStyle(event?.target?.feature?.properties?.data?.forecast));

          //
          // selectedPMForecastPopUp.value = null
        });

        // Podríamos indicar el id de la feature para acceder a ella pero
        // layer._leaflet_id = feature?.properties.name;
      }

      // Mouse control (Select / Unselect)
      // const isHoverForecast = ref(false)
      // const selectedPMPosition = ref([])
      // const selectedPMForecast = ref(null)

      // const selectedPMForecastPopUp = ref(null)
      // var popup = L.popup()
      //   .setLatLng(latlng)
      //   .setContent('<p>Hello world!<br />This is a nice popup.</p>')
      //   .openOn(map);

      // const onFeatureMouseMove = (event) => {

      //   // selectedPMForecast.value = null
      //   // selectedPMPosition.value = []
      //   // debugger
      //   // Si hay algo seleccionado
      //   // if (event?.selected && event?.selected.length > 0) {
      //   if (event.type === 'select' && event?.feature && !isHoverForecast.value) {
      //     // selectedPMPosition.value = extent.getCenter(event.selected[0].getGeometry().extent_)
      //     selectedPMPosition.value = getCenter(event.feature.getGeometry().extent_)

      //     const properties = event.feature.getProperties()
      //     if (properties?.data?.forecast) {
      //       selectedPMForecast.value = properties?.data?.forecast
      //     }
      //   }

      //   //
      //   if (event.type === 'unselect' && !isHoverForecast.value) {
      //     selectedPMForecast.value = null
      //   }
      // }
      // watch(() => isHoverForecast.value, () => {
      //   if (!isHoverForecast.value) {
      //     selectedPMForecast.value = null
      //   }
      // })

      // POL (Features)
      // debugger
      var myGeoJsonLayerGroup = null;
      var myFeaturesMap = {};

      function addNewFeatureToGeoJsonLayerGroup(newGeoJsonData) {
        var newGeoJSONfeature = L.geoJson(newGeoJsonData, { style: getGeojsonStylePOL, onEachFeature: onEachFeaturePOL });
        myFeaturesMap[newGeoJsonData.properties.name] = newGeoJSONfeature;
        myGeoJsonLayerGroup.addLayer(newGeoJSONfeature);
      }

      // eslint-disable-next-line no-unused-vars
      function updateFeature(forecast) {
        // debugger
        //const pmId = forecast.forecastItemHeader.forecastHeader.pm.id
        const pmName = forecast.forecastItemHeader.forecastHeader.pm.poligono

        // var feature = geojsonLayer.getLayer(12345); //your feature id here
        // alert(feature.feature.id);

        var updatedFeature = myFeaturesMap[pmName];
        if (updatedFeature && updatedFeature.getLayers()[0]) {
          let featureLayer = updatedFeature.getLayers()[0]

          // Update Properties
          const properties = featureLayer.feature.properties
          if (!properties.data) {
            properties.data = { }
          }
          properties.data.forecast = forecast

          // Set
          featureLayer.feature.properties = properties
          featureLayer.setStyle(getGeojsonStylePOL(featureLayer.feature))


          // Update
          updatedFeature.clearLayers(); // Remove the previously created layer.
          // updatedFeature.addData(feature); // Replace it by the new data.
          updatedFeature.addLayer(featureLayer)
        }
      }

      // eslint-disable-next-line no-unused-vars
      function deleteFeature(deletedGeoJsonData) {
        var deletedFeature = myFeaturesMap[deletedGeoJsonData.properties.name];
        myGeoJsonLayerGroup.removeLayer(deletedFeature);
      }

      // Initial load
      const loadGeojson = () => {
        myGeoJsonLayerGroup = L.geoJson().addTo(map.value);
        myFeaturesMap = {}
        vectorLayerGeojsonPOL.value.map((item) => {
          addNewFeatureToGeoJsonLayerGroup(item)
        })
      }


      const setupLeafletMap = () => {

        map.value = L.map("map",{
          // Standar options
          // zoomSnap: 0.25, // Ahora usamos el pugin SmoothWheelZoom
          zoomControl: false,
          // layers: baseLayers, // [L.tileLayer]

          // Plugin SmoothZoom
          // smoothZoom: true,
          // smoothZoomDelay: 1500, //Default to 1000
          // Plugin SmoothWheelZoom
          scrollWheelZoom: false, // disable original zoom function
          smoothWheelZoom: true,  // enable smooth zoom
          smoothSensitivity: 2,   // zoom speed. default is 1

          // Plugin Rotate (Ver RotateDist)
          rotate: true,                 // Activate rotation
          bearing: mapRotation.value,   // Set default rotation
          touchRotate: true,            // ??
          rotateControl: {              // Paint rotate control (Deshabilitamos)
            closeOnZeroBearing: false,
            // position: 'bottomleft',  // Si no indicamos se oculta
          },
        }).setView(mapCenter.value, mapZoom.value);

        //
        // map.value.scrollWheelZoom = true;

        // map.value.addEventListener('click', onFeatureClick, false) // Este click se define en onEachFeature
        map.value.on("zoom", onMapZoomUpdate)
        map.value.on("rotate", onMapRotationUpdate)
        map.value.on('moveend', () => {
          const center = map.value.getCenter();
          onMapCenterUpdate([center.lat, center.lng])
        });

        // Add TileLayer
        // if (tileLayerSelected.value) {
        //   L.tileLayer(
        //     tileLayerSelected.value.url,
        //     {
        //       attribution: tileLayerSelected.value?.attribution,
        //       maxZoom: tileLayerSelected.value?.maxZoom || 18,
        //     }
        //   ).addTo(map.value);
        // }

        // debugger
        if (tileLayerSelected.value) {
          const addLayer = baseLayers.find((element) => element.options.id === tileLayerSelected.value.id)
          if (addLayer) {
            map.value.addLayer(addLayer);
          }
        }

        L.marker(defaultMapCenter, { icon: arrow }).addTo(map.value);

        loadGeojson()
      }

      onMounted( () => {
        setupLeafletMap()
      })

      // zoomUpdate: updates a data property with the current zoom level dynamically
      // also changes the visibility of building or room labels based on zoom level
      // watch(() => mapRotation.value, () => {})
      watch(() => mapZoom.value, () => {
        setUserMapZoom(mapZoom.value)
      })
      watch(() => mapCenter.value, () => {
        setUserMapCenter(mapCenter.value)
      })
      watch(() => mapRotation.value, () => {
        setUserMapRotation(mapRotation.value)
      })

      // Go smooth
      //  view.value.setCenter(coordinate)
      //  view.value.setZoom(11.5)

      // coordinate: [Lat, Lng]
      const goToSpot = (coordinate = [0, 0]) => {

        map.value.flyTo(coordinate, 12.5, {
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

      /* --- Forecast --- */
      const loading = ref(false)

      // eslint-disable-next-line no-unused-vars
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
          // .get('http://localhost:8050/public/forecast?pmId=1&dateRef=1-08-2022')
          // .get('http://localhost:8050/public/forecast?riaId=5&dateRef=1-08-2022')
          // .get(`${API_BASE}/public/forecast?riaId=5&dateRef=1-08-2022`)
          .get(url)
          .then(response => {
            console.log(response)
            if (response?.data?.forecasts) {
              response?.data.forecasts.map((forecast) => {
                // overWriteForecastData(forecast)
                updateFeature(forecast)
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
      // onLoadForecast(5)
      loadForecastAll([2,4,5,6])

      // Toolbox options
      const isPOLOpen = ref(false)

      return {
        // Mapbox tools (Layer, Map zoom +/-)
        baseLayerLocal,
        onMapZoomControl, // Map zoom +/-
        onMapRotateReset,   // Rotation reset: North (0º)
        onMapRotateControl, // Rotation control
        mapRotation,        // Rotation set icon rotation

        // Toolbox options
        isPOLOpen,

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
        // mapProjection,
        // mapRotation,
        // mapCenter,
        // mapZoom,
        // Map functions
        // mapZoomUpdate: setUserMapZoom,
        // mapCenterUpdate: setUserMapCenter,
        // Map external FM's
        goMapHome,
        goProductionZone,

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

