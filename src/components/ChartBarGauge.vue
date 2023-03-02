<template>
  <VueSvgGauge
    v-if="isAvailable"
    :start-angle="-90"
    :end-angle="90"
    :value="currentValue"
    :min="minValue"
    :max="maxValue"
    :separator-step="50"
    :separator-thickness="1"
    :gauge-color="[{ offset: 0, color: getBucketToxAColor(forecast) }, { offset: 100, color: getBucketHColor(forecast)}]"
    :scale-interval="0.1"
  />
</template>

<script>
  import { ref } from 'vue';
  import { VueSvgGauge } from 'vue-svg-gauge'

  export default {
    name: 'GaugeChart',
    components: { VueSvgGauge },
    props: {
      forecast: {
        type: Object,
        default: () => {}
      }
    },
    setup(props) {
      // debugger
      // eslint-disable-next-line no-unused-vars
      const forecastLocal = ref(props.forecast)
      const isAvailable = ref(props.forecast || false)
      // watch(() => props.forecast, () => {
      //   // debugger
      //   forecastLocal.value = props.forecast
      //   isAvailable.value = props.forecast || false

      //   currentValue.value = parseInt(getBucketToxA(forecastLocal.value).value, 10)
      // })

      const minValue = ref(0)
      const maxValue = ref(300)
      const currentValue = ref(Math.floor(Math.random() * maxValue.value) + minValue.value)

      const getBucketToxA = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[0];
      const getBucketH = (forecast) => forecast?.forecastItemHeader?.forecastHeader?.forecastBuckets[3];

      const getBucketToxAColor = (forecast) => getBucketToxA(forecast)?.color || 'blue'
      const getBucketHColor = (forecast) => getBucketH(forecast)?.color || 'red'

      if (forecastLocal.value?.forecastItemHeader) {
        currentValue.value = parseInt(getBucketToxA(forecastLocal.value).value, 10)
      }

      // currentValue.value = 3
      return {
        isAvailable,

        currentValue,
        minValue,
        maxValue,

        getBucketToxA,
        getBucketH,

        getBucketToxAColor,
        getBucketHColor
      }
    }
  }
</script>
