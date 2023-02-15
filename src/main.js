import Vue from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import vuetify from './plugins/vuetify';

// Openlayers
// import './plugins/openlayers';
// at some point require vue-openlayers
// const VueOpenLayers = require("vue-openlayers");
// Vue.use(VueOpenLayers);

// No debe ser necesario declarar su usuo
// import VueCompositionAPI from '@vue/composition-api';
// Vue.use(VueCompositionAPI);

// Vuelayers
import VueLayers from 'vuelayers'
import 'vuelayers/dist/vuelayers.css' // needs css-loader
// all input/output coordinates, GeoJSON features in EPSG:4326 projection
// Vue.use(VueLayers)
Vue.use(VueLayers, {
  dataProjection: 'EPSG:4326',
})

// Custom css
import './assets/css/main.css'

Vue.config.productionTip = false;

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
