<template>
  <!--- Home --->
  <div id="home">

    <!-------------- Search Empty Notification ----------->
    <v-dialog v-model="searchEmpty">
      <v-card>
        <v-card-text>
          You need to type something before you can search for it!
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" block @click="searchEmpty = false">ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-------------------------- Search Bar ----------------------->
    <div id="custom-toolbar">
      <div id="custom-search-wrapper" class="d-flex align-center">

        <!-- Menu button -->
        <v-tooltip text="Menu" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              class="ma-auto"
              v-bind="props"
              elevation="0"
              icon
              large
              @click="showMenu = true"
            >
              <v-icon size="24">mdi-menu</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <!----- Search Field ----->
        <!-- item-text="id" -->
        <!-- style="width: 100%;" -->
        <v-autocomplete
          bg-color="white"
          class="w-100 custom"
          v-model="productionZoneFilterLocal"
          :items="productionZoneFilterOptions"
          placeholder="Buscar polígonos"
          solo
          :dense="false"
          clearable
          hide-details="auto"
          @change="goProductionZone()"
        >
        </v-autocomplete>

        <!---------- Search Icon Button --------------------->
        <v-spacer></v-spacer>
        <v-tooltip text="Search" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              class="ma-auto"
              elevation="0"
              icon
              large
              @click="goProductionZone()"
            >
              <v-icon size="24">mdi-magnify</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <!-- Search Divider -->
        <div id="custom-search-divider"></div>

        <!-- Directions Icon Button: mdi-directions -->
        <!-- @click="showNavigation = true" -->
        <v-tooltip text="Navigate" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              class="ma-auto"
              elevation="0"
              icon
              large
              @click="goMapHome"
            >
              <v-icon size="24">mdi-crosshairs-gps</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <!-- <v-date-picker></v-date-picker> -->
      </div>
    </div>

    <!-------------------------- End of Search Bar -------------------------------->

    <!-------------- Main Menu Drawer ---------------->
    <!-- :temporary="$vuetify.breakpoint.smAndDown" -->
    <v-navigation-drawer
      v-model="showMenu"
      width="400"
      mobile-breakpoint="sm"
      absolute
      :right="$vuetify.rtl"
      touchless
      :temporary="true"
    >
      <!-- Toolbar -->
      <v-toolbar
        src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
      >
        <v-app-bar-nav-icon>
          <v-icon color="white">mdi-home</v-icon>
        </v-app-bar-nav-icon>
        <v-toolbar-title class="white--text">emproMar</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon color="white">
          <v-icon @click="showMenu = false">mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- BaseLayers -->
      <div class="mt-4 ml-4">
        <v-radio-group
          v-model="baseLayer"
          column
          @change="onChangeLayerBase(baseLayer)"
        >
          <template v-slot:label>
            <div class="d-flex align-center">
              <v-icon class="me-2">mdi-map</v-icon>
              <h3>Capa base</h3>
            </div>
          </template>
          <v-radio
            class="ml-4"
            v-for="option in baseLayerOptions"
            :key="option.value"
            :label="option.text"
            :color="option.color"
            :value="option.value"
          ></v-radio>
        </v-radio-group>
      </div>

      <v-divider></v-divider>
      <div class="d-flex flex-column align-start ml-4">

        <div class="d-flex">
          <v-icon class="me-2">mdi-layers</v-icon>
          <span class="font-weight-bold text-h7">Capas</span>
        </div>

        <div class="d-flex flex-column ml-4 mt-2">
          <v-switch
            class="mt-0"
            v-model="showLayerPOL"
            inset
            label="Zonas de producción"
            @change="onchangeLayerPOL"
          ></v-switch>
          <v-switch
            class="mt-0"
            v-model="showLayerPMI"
            inset
            label="Puntos de muestreo"
            @change="onchangeLayerPMI"
          ></v-switch>
        </div>
      </div>
      <v-divider></v-divider>
      <v-list>
        <v-list-item class="mt-2">
          <v-list-item-icon class="mr-1">
            <v-icon>mdi-cog</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>


    <!--- Map Component --->
    <MapComponent
      ref="map"
      :baseLayer="baseLayer"
      :showLayerPOL="showLayerPOL"
      :showLayerPMI="showLayerPMI"
    />
    <!-- <MapComponent/> -->

    <!-- Play -->
    <ForecastPlay class="map-play"/>

    <!-- Tools -->
    <ForecastLeyend class="map-tools"/>
  </div>

</template>

<script>
  import { ref, watch } from 'vue';
  import useMap from '@/service/useMap';
  import zoneListArousa from '../geojson/POL_Interior_Arousa.json'; // Import rooms GeoJSON

  // Main component
  import MapComponent from '../components/MapOL.vue'; // Import Map Component
  // import MapComponent from '../components/MapOLExt2.vue'; // Import Map Component
  // import MapComponent from '../components/MapOLAnimation.vue'; // Import Map Component

  // Components
  import ForecastLeyend from '../components/ForecastLeyend.vue'; // Import Map Component
  import ForecastPlay from '../components/ForecastPlay.vue'; // Import Map Component

  export default {
    // Name of component
    name: 'home-component',

    // Child components
    components: {
      MapComponent,
      ForecastLeyend,
      ForecastPlay,
    },

    setup() {
      const showMenu = ref(false)
      const searchEmpty = ref(false)

      // Map component
      const map = ref(null);
      const goMapHome = () => {
        map.value.goMapHome(); // La funcion ha sido desarrollada en el componente Map.vue
      };
      const goProductionZone = () => {
        if (!productionZoneFilterLocal.value) {
          return;
        }
        const selected = zoneListArousa.features.find((item) => item?.properties?.name === productionZoneFilterLocal.value);
        if (selected) {
          map.value.goProductionZone(selected); // La funcion ha sido desarrollada en el componente Map.vue
        }
      };

      // Production Zones filter
      const productionZoneFilterLocal = ref(null);
      const productionZoneFilterOptions = ref([]);

      // Initial loal all filters
      productionZoneFilterOptions.value = zoneListArousa.features.map((item) => item.properties.name);
      // Listen for changes
      watch(() => productionZoneFilterLocal.value, () => {
        goProductionZone();
      });

      // >>> Base layer selection
      const { tileLayerOptions } = useMap();

      const baseLayer = ref(localStorage.getItem('map-layer-base') || 'openstreetmap');
      const baseLayerOptions = ['openstreetmap', 'mapbox', 'google-satellite-only'].map((key) => {
        const tileLayer = tileLayerOptions.find((element) => element.id === key);
        return {
          value: tileLayer?.id || key,
          text: tileLayer?.id || key,
          color: 'info',
          icon: 'mdi-map',
        };
      });

      // Guardamos la capa base para la próxima vez que el usuario inicie la app
      const onChangeLayerBase = (newLayer) => {
        localStorage.setItem('map-layer-base', newLayer);
        baseLayer.value = newLayer;

      // Send new layer to Map
      // map.value.onChangeLayerBase(newLayer)
      };

      // Get boolean value if are stored at LocalStorage
      const getLocalStorageBoolean = (key) => {
        const value = localStorage.getItem(key)
        if (value == 'true' || value == 'false') {
          return JSON.parse(value) === true
        }
        return undefined
      }
      // Layers: POL, PMI
      const showLayerPOL = ref(getLocalStorageBoolean('map-layer-pol') || true);
      const showLayerPMI = ref(getLocalStorageBoolean('map-layer-pmi') || false);

      const onchangeLayerPOL = (value) => {
        localStorage.setItem('map-layer-pol', value)
      }
      const onchangeLayerPMI = (value) => {
        localStorage.setItem('map-layer-pmi', value)
      }


      return {
        showMenu,
        searchEmpty,

        map,
        goMapHome,
        goProductionZone,

        // Search
        productionZoneFilterLocal,
        productionZoneFilterOptions,

        // Base layer
        baseLayer,
        baseLayerOptions,
        onChangeLayerBase,

        showLayerPOL,
        onchangeLayerPOL,

        showLayerPMI,
        onchangeLayerPMI,
      };
    },
  };
</script>

<style lang="scss" scoped>

  /* Remove Chrome's button:focus borders */
  button:focus { outline: 0; }

  /* Home Component */
  #home {
    height: 100%;
    width: 100%;
    position:fixed;
  }

  /* Custom Toolbar for Search Bar */
  #custom-toolbar {
    background: none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    // width: 100%;
    // display:block;
    // height: 0px;
    padding:10px;
  }

  /* Custom Search Wrapper for formatting*/
  #custom-search-wrapper {
    background: white;
    max-width: 400px;
    // width: 400px;
    height: 56px;
    border-radius: 10px;
    -webkit-box-shadow: 0px 0px 3px 0px rgb(0 0 0 / 25%);
    -moz-box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.25);
    box-shadow: 0px 0px 3px 0px rgb(0 0 0 / 25%);
  }

  .map-play {
    color: #000;
    position: absolute;
    box-shadow: 0 1px 3px 0 rgba(0,0,0,.4);
    bottom: 36px;
    left: 12px;
    width: calc(100% - 24px);
    z-index: 0
  }
  /* Contenedor de la leyenda */
  .map-tools {
    background: white;
    position: absolute;
    bottom: 0;
    margin: 0 auto;
    max-width: 960px;
    width: 100%;
    z-index: 0
  }

  /* Custom Search Divider */
  #custom-search-divider {
    background: rgba(0,0,0,0.25);
    width:1px;
    height:30px;
    margin:auto;
  }



</style>
<style>
  /* .custom.v-text-field>.v-input__control>.v-input__slot:before {
    border-style: none;
  }
  .custom.v-text-field>.v-input__control>.v-input__slot:after {
      border-style: none;
  } */
  .custom.v-text-field.v-text-field--solo:not(.v-text-field--solo-flat) > .v-input__control > .v-input__slot {
      box-shadow: none;
  }
</style>
