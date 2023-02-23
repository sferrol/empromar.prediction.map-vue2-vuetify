<template>
  <div ref="map" style="width: 100%; height: 100%"></div>
</template>

<script>
  import Map from 'ol/Map';
  import View from 'ol/View';
  import TileLayer from 'ol/layer/Tile';
  import Stamen from 'ol/source/Stamen';

  import VectorLayer from 'ol/layer/Vector';
  import VectorSource from 'ol/source/Vector';
  import Feature from 'ol/Feature';
  import { Point } from 'ol/geom';

  // eslint-disable-next-line no-unused-vars
  import {Fill, Stroke, Style, Circle, Icon, Text } from 'ol/style.js';

  // import 'ol-ext/control/Zoom';
  // import { FontSymbol } from 'ol-ext/style'
  import FontSymbol from 'ol-ext/style/FontSymbol'

  export default {
    mounted() {
      // const map = new Map({
      //   target: this.$refs.map,
      //   layers: [
      //     new TileLayer({
      //       source: new OSM(),
      //     }),
      //   ],
      //   view: new View({
      //     center: [0, 0],
      //     zoom: 2,
      //   }),
      //   // controls: {
      //   //   zoom: new ol.control.Zoom(),
      //   // },
      // });

      var map = new Map({
        target: this.$refs.map,
        view: new View({ zoom: 5, center: [166326, 5992663] }),
        layers: [	new TileLayer({ source: new Stamen({ layer: 'watercolor' }) }) ]
      });

      // Set FontAwesome package here
      var glyph;
      var stylefn = function() {
        glyph = new FontSymbol({
          glyph: "fa-wheelchair",
          fontStyle: 'bold',
          form: 'circle',
          radius: 20,
          fill: new Fill({
            color: "#369"
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 2
          })
        });
        return new Style({
          image: glyph
        });
      };

      // Vector layer
      var vector = new VectorLayer({
        source: new VectorSource(),
        style: stylefn
      });
      var pt = new Feature(new Point([259274, 6398696]));
      vector.getSource().addFeature(pt);


      map.addLayer(vector);

    },
  };
</script>
