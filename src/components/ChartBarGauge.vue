<template>
  <VueSvgGauge
    :start-angle="-90"
    :end-angle="90"
    :value="currentValue"
    :min="minValue"
    :max="maxValue"
    :separator-step="50"
    :separator-thickness="1"
    :gauge-color="[{ offset: 0, color: '#347AB0'}, { offset: 100, color: '#8CDFAD'}]"
    :scale-interval="0.1"
  />
</template>

<script>
  import { ref } from 'vue';
  import { VueSvgGauge } from 'vue-svg-gauge'

  export default {
    name: 'GaugeChart',
    components: { VueSvgGauge },
    setup() {
      // debugger
      const minValue = ref(0)
      const maxValue = ref(300)
      const currentValue = ref(Math.floor(Math.random() * maxValue.value) + minValue.value)

      // currentValue.value = 3
      return {
        currentValue,
        minValue,
        maxValue
      }
    }
  }
</script>
