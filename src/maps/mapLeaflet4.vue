<template>
  <div class="map_container_wrapper">
    <div id="map"></div>
  </div>
</template>

  <script>
  import { onMounted, ref } from "vue";

  // Leaflet
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";

  // Leaflet plugings
  import "leaflet-rain"

  import useMap from "@/service/useMap";

  // GeoJSON Files (Import before undate from API)
  import geojsonDataPOL from '../geojson/POL.json'; // Import vectorLayerGeojsonPOL GeoJSON (LonLat)

  export default {
    components: {  },
    setup() {

      // Productions Zones
      const vectorLayerGeojsonPOL = ref(geojsonDataPOL.features)
      const forecastDefault = vectorLayerGeojsonPOL.value.find( (element) => element?.properties?.name === 'Ribeira B')

      // Map
      const map = ref(null)
      const { mapCenter, mapZoom } = useMap()

      const mapRain = ref(null)
      const locadRain = () => {
        debugger
        const options = {
          angle: 80,
          width: 1,
          spacing: 10,
          length: 4,
          interval: 10,
          speed: 1,
          color: 'Oxa6b3e9'
        }
        mapRain.value = L.rain(forecastDefault.geometry.coordinates, options).addTo(map.value);
      }

      const setupLeafletMap = () => {

        map.value = L.map("map",{
          // Standar options
          // zoomSnap: 0.25, // Ahora usamos el pugin SmoothWheelZoom
          zoomControl: false,
          // layers: baseLayers, // [L.tileLayer]

        }).setView(mapCenter.value, mapZoom.value);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: mapZoom.value,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map.value);

        // loadGeojson()
        locadRain()
      }

      onMounted( () => {
        setupLeafletMap()
      })

      return {
        map
      }
    }
  }
  </script>
  <style scoped>

  .map_container_wrapper {
    /* float: left; */
    position: relative;
    height: 100vh;
  }
  /* Mapa */
  #map {
    /* float: left; */
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
</style>
