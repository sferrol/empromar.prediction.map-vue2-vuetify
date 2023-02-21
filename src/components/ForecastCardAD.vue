<template>
  <div class="d-flex flex-column">

    <v-card class="d-flex flex-column w-100 rounded-0">

      <!-- Header -->
      <div class="d-flex pa-3">
        <div class="d-flex align-baseline">
          <h3>Avance / Descenso</h3><span class="ml-1">de Toxina</span>
        </div>

        <v-spacer></v-spacer>
        <div class="d-flex align-center">
          <v-icon>mdi-monitor-dashboard</v-icon>
          <a :href="getUrlInforme(forecastLocal)" target="_blank" class="ml-1">Ver Informe</a>
        </div>
      </div>

      <!-- Body -->
      <div class="d-flex flex-column pa-3">

        <!-- Bucket Left + Right -->
        <!-- <div class="d-flex">
          <div class="d-flex flex-column">
            <span>
              <span class="font-weight-bold" :style="{ 'font-size': '2rem', color: getBucketLeft(forecast).color }">
                <i :class="getBucketLeft(forecastLocal).icon"></i>
                {{ getBucketLeft(forecastLocal).value }}
              </span>
              {{ getHeader(forecastLocal).feedType.feedTypeUnit }}
            </span>
            <span>
              <div class="text-muted">{{ getBucketLeft(forecastLocal).text }}</div>
              <div class="text text-h6">{{ getBucketLeft(forecastLocal).motion }}</div>
            </span>
          </div>

          <div class="ml-auto d-flex flex-column text-right">
            <span>
              <span class="text-bold" :style="{ 'font-size': '2rem', color: getBucketRight(forecastLocal).color }">
                <i :class="getBucketRight(forecastLocal).icon"></i>
                {{ getBucketRight(forecastLocal).value }}
              </span>
              {{ getHeader(forecastLocal).feedType.feedTypeUnit }}
            </span>
            <span>
              <div class="text-muted">{{ getBucketRight(forecastLocal).text }}</div>
              <div class="text text-h6">{{ getBucketRight(forecastLocal).motion }}</div>
            </span>
          </div>
        </div> -->

        <div class="position-relative mb-5">
          <Bar
            id="chart-ad"
            :options="chartOptions"
            :data="chartData"
            :plugins="[chartJsPluginBarchartBackground]"
          />
          <!-- <canvas id="chart-ad" height="200"></canvas> -->
        </div>
      </div>

    </v-card>

  </div>
</template>

<script>
  import { computed, ref, watch } from 'vue';

  import { Bar } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

  export default {
    name: 'forecast-chart-ad-component',
    components: {
      Bar,
    },
    props: {
      forecast: {
        type: Object,
        default: () => {}
      }
    },
    setup(props) {
      const forecastLocal = ref(JSON.parse(JSON.stringify(props.forecast)));

      // props passed to setup function is reactive object (made probably by reactive()), it's properties are getters.
      // Watching a getter: https://v3.vuejs.org/api/computed-watch-api.html#watching-a-single-source
      watch(() => props.forecast, () => {
        forecastLocal.value = JSON.parse(JSON.stringify(props.forecast));
      });


      const getHeader = (forecast) => forecast?.forecastItemAD?.forecastHeader;
      const getChart = (forecast) => forecast?.forecastItemAD?.forecastChart;

      const getBucketLeft = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[0];
      const getBucketRight = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[1];

      const getUrlInforme = (forecast) => {
        const dateRef = getHeader(forecast)?.dateRef;
        const riaId = getHeader(forecast)?.pm?.idRia;

        return `https://prediccion.empromar.com/backoffice/intoxicacion/launch?ria=${riaId}&dateRef=${dateRef}`
      }

      // const chartLabels = computed(() => {
      //   // return getChart(forecastLocal.value)?.labels
      //   return forecastLocal.value?.forecastItemAD?.forecastChart?.labels
      // })
      // const getDatasetToxA_Avance = computed(() => {
      //   // return getChart(forecastLocal.value)?.series[0]
      //   return forecastLocal.value?.forecastItemAD?.forecastChart?.series[0]
      // })
      // const getDatasetToxA_Descenso = computed(() => {
      //   // return getChart(forecastLocal.value)?.series[1]
      //   return forecastLocal.value?.forecastItemAD?.forecastChart?.series[1]
      // })
      const options = computed(() => {
        // return getChart(forecastLocal.value)?.options
        return forecastLocal.value?.forecastItemAD?.forecastChart?.options
      })

      const chartData = computed( () => {
        return {
          labels: forecastLocal.value?.forecastItemAD?.forecastChart?.labels,
          datasets: [
            {
              label: 'Avance',
              data: forecastLocal.value?.forecastItemAD?.forecastChart?.series[0],
              backgroundColor: 'rgb(214,28,105)',
              stack: 'Stack 0',
            },
            {
              label: 'Descenso',
              data: forecastLocal.value?.forecastItemAD?.forecastChart?.series[1],
              backgroundColor: 'rgba(60,141,188,0.9)',
              stack: 'Stack 0',
            }
          ]
        }
      })
      const defaultOptions = {
        color: 'rgb(255, 205, 86)', // Yellow
        axis: 'category',
        tickValue: 11 // Valor a partir del cual
      };

      // https://github.com/datavisyn/chartjs-plugin-barchart-background/blob/master/src/plugin.js
      const chartJsPluginBarchartBackground = {
        id: 'chartJsPluginBarchartBackground',

        _getLabelValue(label) {
          if (label instanceof Array) {
            return label[0];
          }
          return label;
        },
        _getLineValue(scale, index, offsetGridLines) {
          // see core.scale.js -> getLineValue
          var lineValue = scale.getPixelForTick(index);

          if (offsetGridLines) {
            if (index === 0) {
              lineValue -= (scale.getPixelForTick(1) - lineValue) / 2;
            } else {
              lineValue -= (lineValue - scale.getPixelForTick(index - 1)) / 2;
            }
          }
          return lineValue;
        },

        _hasData(data) {
          return data && data.datasets && data.datasets.length > 0;
        },

        _findScale(chart, options) {
          const scales = Object.keys(chart.scales).map((d) => chart.scales[d]);
          if (options.axis === 'category') {
            return scales.find((d) => d.type === 'hierarchical' || d.type === 'category');
          }
          return scales.find((d) => d.id.startsWith(options.axis));
        },

        beforeDraw(chart, _easingValue, options) {
          options = Object.assign({}, defaultOptions, options);

          const scale = this._findScale(chart, options);
          if (!this._hasData(chart.config.data) || !scale) {
            return;
          }
          const ticks = scale.getTicks();
          if (!ticks || ticks.length === 0) {
            return;
          }

          const isHorizontal = scale.isHorizontal();
          const chartArea = chart.chartArea;

          //const soptions = scale.options;
          //const gridLines = soptions.gridLines;

          // push the current canvas state onto the stack
          const ctx = chart.ctx;
          ctx.save();

          // set background color
          ctx.fillStyle = options.color;

          // based on core.scale.js
          const offsetGridLines = true && ticks.length > 1; //gridLines && gridLines.offsetGridLines
          // const tickPositions = ticks.map((_, index) => this._getLineValue(scale, index, offsetGridLines && ticks.length > 1));

          // Posicionarse en el tick del día actual [0..14] Nos posicionamos en el tick 11
          // var tickSelected = ticks.find((element, index) => this._getLabelValue(element.label) >= options.tickValue); // 11, 12, 13, 14
          // if (tickSelected) {
          //     tickValueCartesian = this._getLineValue(scale, tickSelected.$context.index, offsetGridLines)
          // }

          // Posicionarse en el tick
          //  Hacia adelante: var tickIndex = ticks.findIndex((element, index) => this._getLabelValue(element.label) >= options.tickValue); // 11, 12, 13, 14
          //  Buscamos el valor exacto, sino lo encuentra el <= (No siempre es válido pero)
          var tickValueCartesian = 0;
          var reverseTicks = [...ticks].reverse();
          var tickIndex = reverseTicks.findIndex((element) => this._getLabelValue(element.label) == options.tickValue); // 11, 12, 13, 14
          if (tickIndex === -1) {
            tickIndex = reverseTicks.findIndex((element) => this._getLabelValue(element.label) <= options.tickValue); // 11, 12, 13, 14
          }
          if (tickIndex >= 0) {
            tickValueCartesian = this._getLineValue(scale, ticks.length - 1 - tickIndex, offsetGridLines)
          }

          // Posicion cartesiana del tick
          if (tickValueCartesian > 0) {
            if (isHorizontal) {
              const chartHeight = chartArea.bottom - chartArea.top;
              const x = tickValueCartesian;
              const x2 = chartArea.right;
              ctx.fillRect(x, chartArea.top, x2 - x, chartHeight);

            } else {
              const chartWidth = chartArea.right - chartArea.left;

              const y = tickValueCartesian;
              const y2 = chartArea.bottom;
              ctx.fillRect(chartArea.left, y, chartWidth, y2 - y);
            }
          }

          // restore the saved state
          ctx.restore();
        }
      };

      return {
        forecastLocal,

        getHeader,
        getChart,

        getUrlInforme,

        getBucketLeft,
        getBucketRight,

        chartData,
        chartOptions: {
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
          },
          responsive: true,
          legend: {
            display: true
          },
          plugins: {
            chartJsPluginBarchartBackground: {
              color: options.value ? options.value.color : 'yellow',
              axis: 'category',
              tickValue: options.value ? options.value.tickValue : undefined,  // Valor a partir del cual hay que pintar
            }
          },
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            }
          }
        },
        chartJsPluginBarchartBackground,
      }
    }
  }
</script>

<style>

</style>
