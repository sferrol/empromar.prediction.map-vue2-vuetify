<template>
  <div class="d-flex flex-column">

    <!-- Imagen -->
    <!-- <img
      v-if="!minimize"
      style="width: 100%; height: 100px;"
      src="../assets/default_thumbnail.png" /> -->

    <v-card class="d-flex flex-column w-100 rounded-0" v-if="forecast">
      <!-- <v-card-header :style="{'background-color': getBucketH(forecast).color}">
          <div class="md-title">{{ forecast.forecastItemHeader.forecastHeader.pm.poligono }}</div>
          <div class="md-title">{{ getBucketH(forecast).text }}</div>
        </v-card-header> -->
      <!-- <v-toolbar :elevation="8" :title="getBucketH(forecast).text" :color="getBucketH(forecast).color"> -->
      <v-toolbar :elevation="8" :title="getBucketH(forecast).text" :color="getBucketH(forecast).color">
        <v-toolbar-title>{{ getBucketH(forecast).text }}</v-toolbar-title>

        <v-spacer></v-spacer>
        <v-btn icon @click="$emit('update:minimize', false)" v-if="minimize">
          <v-icon>mdi-window-maximize</v-icon>
        </v-btn>
        <v-btn icon @click="$emit('update:minimize', true)" v-if="!minimize">
          <v-icon>mdi-window-maximize</v-icon>
        </v-btn>
        <v-btn icon @click="$emit('close', true)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Body -->
      <div class="pa-3">
        <div style="display: grid; grid-template-columns: 36% 64%; font-size: 14px;">
          <!-- Bucket Left: Current ToxA -->
          <div class="d-flex flex-column mt-1">
            <span class="text-muted" style="border-bottom: 1px solid grey;">Actual</span>
            <span class="mt-2" style="margin-top: -1px">
              <span class="font-weight-bold" :style="{ 'font-size': '2rem', color: getBucketToxA(forecast).color }">
                {{ getBucketToxA(forecast).value }}
              </span>
              <span class="text-muted">{{ getHeader(forecast).feedType.feedTypeUnit }}</span>
            </span>
            <span>
              <span class="text-muted">{{ getBucketToxA(forecast).text }}</span>
            </span>
            <div class="d-flex">
              <div v-if="getBucketAnalisis(forecast)" class="mr-1">
                <span :style="{ padding: '1px', 'background-color': getBucketAnalisis(forecast).color }">
                  {{ getBucketAnalisis(forecast).value }}
                </span>
                <span class="text-muted">{{ getBucketAnalisis(forecast).text }}</span>
              </div>
              <div v-if="getBucketPlan(forecast)" class="mr-1">
                <span :style="{ padding: '1px', 'background-color': getBucketPlan(forecast).color }">
                  {{ getBucketPlan(forecast).value }}
                </span>
                <span class="text-muted">{{ getBucketPlan(forecast).text }}</span>
              </div>
              <div v-if="getBucketEstado(forecast)">
                <span :style="{ padding: '1px', 'background-color': getBucketEstado(forecast).color }">
                  {{ getBucketEstado(forecast).value }}
                </span>
                <span class="text-muted">{{ getBucketEstado(forecast).text }}</span>
              </div>
            </div>
          </div>

          <!-- Right: Previsión 'linear-gradient'('to right', getBucketToxA(forecast).color, getBucketH(forecast).color) -->
          <div class="d-flex flex-column mt-1">
            <div class="d-flex justify-space-between ml-1"
                 :style="{'border-bottom': '4px solid', 'border-image': `linear-gradient(to right, ${getBucketToxA(forecast).color}, ${getBucketH(forecast).color}) 1` }"
            >
              <span class="text-muted">Previsión 4d.</span>
              <v-spacer />
              <span class="text-muted pr-1">Fiab.</span>
              <v-progress-linear
                v-model="getBucketToxAAfinidad(forecast).value"
                :color="getBucketToxAAfinidad(forecast).color"
                height="25"
                style="width: 80px; height: 1.2rem; left: unset; transform: unset"
              >
                <template v-slot:default="{ value }">
                  <strong>{{ Math.ceil(value) }}%</strong>
                </template>
              </v-progress-linear>
            </div>

            <div class="mt-2" style="display: grid; grid-template-columns: 50% 50%;">

              <!-- Bucket Center: Forecast ToxA -->
              <div class="d-flex flex-column align-center">
                <span class="text-center-">
                  <span class="font-weight-bold" :style="{'font-size': '2rem', color: getBucketToxA(forecast).color}">
                    {{ getBucketToxA(forecast).value }}
                  </span>
                  <!-- ICON + value -->
                  <span class="font-weight-bold" :style="{ 'font-size': '1rem', color: getBucketToxAAD(forecast).color }">
                    <i :class="getBucketToxAAD(forecast).icon"></i>
                    <!-- <v-icon :icon="`fa:${getBucketToxAAD(forecast).icon}`" /> -->
                    {{ getBucketToxAAD(forecast).value }}
                  </span>
                </span>
                <div class="text-center">
                  <span class="text-muted">{{ getBucketToxAAD(forecast).motion }}</span>
                </div>
              </div>

              <!-- Bucket Right (Header) -->
              <div class="d-flex flex-column align-center">
                <span class="font-weight-bold"
                      :style="{ 'font-size': '2rem', color: getBucketH(forecast).color }">

                  <!-- <v-icon :icon="fa2mdiTransform(getBucketH(forecast).icon)" /> -->
                  <!-- El servidor envía fontawesome icon: Si no está instalado debemos usar fa2mdiTranform -->
                  <i :class="getBucketH(forecast).icon"></i>
                  <!-- <v-icon :icon="`fa:${getBucketH(forecast).icon}`" /> -->
                </span>
                <span class="text-h6" style="margin-top: -0.35rem;">{{ getBucketH(forecast).motion }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-white">
        <!-- <div class="fa-3x">
          <i class="fa-solid fa-circle-plus fa-beat"></i>
          <i class="fa-solid fa-heart fa-beat"></i>
          <i class="fa-solid fa-heart fa-beat" style="--fa-animation-duration: 0.5s;" ></i>
          <i class="fa-solid fa-heart fa-beat" style="--fa-animation-duration: 2s;"></i>
          <i class="fa-solid fa-heart fa-beat" style="--fa-beat-scale: 2.0;"></i>
        </div> -->

        <!-- <div class="fa-3x">
          <i class="fas fa-chevron-up fa-spin"></i>
          <i class="fas fa-spinner fa-spin"></i>
          <i class="fas fa-circle-notch fa-spin"></i>
          <i class="fas fa-sync fa-spin"></i>
          <i class="fas fa-cog fa-spin"></i>
          <i class="fas fa-spinner fa-pulse"></i>
          <i class="fas fa-stroopwafel fa-spin"></i>
        </div> -->
        <!-- <div class="fa-4x">
          <i class="fas fa-seedling" data-fa-transform="shrink-8" style="background:MistyRose"></i>
          <i class="fas fa-seedling" data-fa-transform="shrink-8 up-6" style="background:MistyRose"></i>
          <i class="fas fa-seedling" data-fa-transform="shrink-8 right-6" style="background:MistyRose"></i>
          <i class="fas fa-seedling" data-fa-transform="shrink-8 down-6" style="background:MistyRose"></i>
          <i class="fas fa-seedling" data-fa-transform="shrink-8 left-6" style="background:MistyRose"></i>
        </div> -->

        <!-- <span class="fa-stack fa-2x">
          <i class="fas fa-chevron-up fa-stack" data-fa-transform="up-8"></i>
          <i class="fas fa-chevron-up fa-stack" data-fa-transform="up-4"></i>
        </span> -->
      </div>
    </v-card>


    <!--  -->
    <ForecastCardAD :forecast="forecastLocal" v-show="forecast"/>
  </div>
</template>

<script>
// import { ref } from '@vue/composition-api'
  import { ref, watch } from 'vue';
  // import BarChart from './BarChart'
  import ForecastCardAD from './ForecastCardAD.vue'

  export default {
    name: 'forecast-component',
    components: {
      ForecastCardAD,
    },
    props: {
      forecast: {
        type: Object,
        default: () => {},
      },
      minimize: {
        type: Boolean,
        default: true,
      },
    },
    setup(props) {
      const forecastLocal = ref(JSON.parse(JSON.stringify(props.forecast)));

      // props passed to setup function is reactive object (made probably by reactive()), it's properties are getters.
      // Watching a getter: https://v3.vuejs.org/api/computed-watch-api.html#watching-a-single-source
      watch(() => props.forecast, () => {
        forecastLocal.value = JSON.parse(JSON.stringify(props.forecast));
      });

      // forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets
      // const header = props.forecast?.forecastItemHeader?.forecastHeader

      // const getBucketToxA = header?.forecastBuckets[0] // Left
      // const getBucketToxAForecast = header?.forecastBuckets[1] // <!-- Left-->
      // const getBucketToxAAD = header?.forecastBuckets[2] // <!-- Right-->
      // const getBucketH = header?.forecastBuckets[3] //
      // const getBucketEstado = header?.forecastBuckets[4] //
      // const getBucketPlan = header?.forecastBuckets[5] //
      // const getBucketAnalisis = header?.forecastBuckets[6] //
      // const getBucketToxAAfinidad = header?.forecastBuckets[7] //

      // const fa2mdiTransform = (faIcon) => {
      //   if (faIcon === 'fas fa-exclamation-triangle')
      //     return 'mdi-alert'
      //   return 'mdi-plus'
      // }

      const getHeader = (forecast) => forecast?.forecastItemHeader?.forecastHeader;

      const getBucketToxA = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[0];
      const getBucketToxAForecast = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[1];
      const getBucketToxAAD = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[2];
      const getBucketH = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[3];
      const getBucketEstado = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[4];
      const getBucketPlan = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[5];
      const getBucketAnalisis = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[6];
      const getBucketToxAAfinidad = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[7];

      return {
        forecastLocal,

        getHeader,
        getBucketToxA,
        getBucketToxAForecast,
        getBucketToxAAD,
        getBucketH,
        getBucketEstado,
        getBucketPlan,
        getBucketAnalisis,
        getBucketToxAAfinidad,
      };
    },
  };
</script>
  <style>

  </style>
