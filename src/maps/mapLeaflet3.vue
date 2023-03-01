<template>
  <div>
    <l-map
      style="z-index:0; height:100%; width:100%; position:fixed"
      :zoom="zoom"
      :center="center"
    >
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
    </l-map>
  </div>
</template>

  <script>
  import {LMap, LTileLayer} from 'vue2-leaflet';

  export default {
    components: { LMap, LTileLayer, },
    // data () {
    //   return {
    //     url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    //     attribution:
    //       '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    //     zoom: 8,
    //     center: [47.313220, -1.319482],
    //   };
    // }
    setup() {
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution:
          '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        zoom: 12,
        center: [42.51994, -8.93902],
      }
    }
  }
  </script>
