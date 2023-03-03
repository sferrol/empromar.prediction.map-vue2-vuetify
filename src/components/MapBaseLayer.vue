<template>
  <div class="d-flex align-center">

    <v-menu
      transition="scale-transition"
      origin="center center"
      v-model="isSelectorOpen"
      open-on-hover
      offset-x
      right
      direction="right"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-on="on"
          v-bind="attrs"
          v-model="isSelectorOpen"
          x-small
          fab
          :color="(baseLayerLocal && baseLayerLocal.color) || 'blue darken-2'"
        >
          <v-icon v-if="isSelectorOpen">
            mdi-close
          </v-icon>
          <!-- <span v-else>{{ baseLayerLocal ? baseLayerLocal.value : '??' }}</span> -->
          <v-icon v-else>
            {{baseLayerLocal.icon}}
          </v-icon>
        </v-btn>
      </template>

      <!-- <div class="d-flex flex-column" :class="[$vuetify.breakpoint.xs ? 'mb-12' : 'mt-12']"> -->
      <div class="d-flex flex-column-">
        <!-- @click="baseLayer = item" -->
        <!-- @click="$emit('update:baseLayer', item)" -->
        <v-btn
          class="mx-2"
          v-for="(item, index) in baseLayerOptions"
          :key="index"
          fab
          x-small
          :color="item.color"
          @click="onChangeLayerBase(item)"
        >
          <v-icon v-if="item.icon">
            {{ item.icon }}
          </v-icon>
          <span v-else>{{ item.text }}</span>
        </v-btn>
      </div>
    </v-menu>
  </div>
</template>
<script>
  import { ref, watch } from 'vue';
  import useMap from '@/service/useMap';

  export default {
    name: 'map-base-layer',
    props: {
      // baseLayer: {
      //   type: Object,
      //   default: () => ({
      //     value: 'openstreetmap',
      //     text: 'OS',
      //     color: 'blue',
      //     image: 'mdi-terrain'
      //   }),
      // },
      baseLayer: {
        type: String,
        default: 'openstreetmap',
      },
    },
    setup(props, {emit}) {

      // Only for internal use of control (Change icon when selected)
      const isSelectorOpen = ref(false)

      // >>> Base layer selection
      const { tileLayerOptions } = useMap();
      const baseLayerOptions = ['openstreetmap', 'mapbox', 'windy', 'google-satellite-only'].map((key) => {
        const tileLayer = tileLayerOptions.find((element) => element.id === key);
        return {
          value: tileLayer?.id || key,
          text: tileLayer?.text || key,
          color: tileLayer?.color ||'info',
          icon: tileLayer?.icon || 'mdi-map',
        };
      });

      const getBaseLayerObject = (key) => {
        const baselayerkey = key|| localStorage.getItem('map-layer-base') || 'openstreetmap'

        return tileLayerOptions.find((element) => element.id === baselayerkey);
      }

      // >>> Variables
      const baseLayerLocal = ref(getBaseLayerObject(props.baseLayer));
      watch(() => baseLayerLocal.value, () => {
        // debugger
        baseLayerLocal.value = getBaseLayerObject(props.baseLayer)
      })

      // Guardamos la capa base para la próxima vez que el usuario inicie la app
      const onChangeLayerBase = (newLayer) => {
        // debugger
        localStorage.setItem('map-layer-base', newLayer.value);
        baseLayerLocal.value = newLayer;

        // Send new layer to Map
        emit('update:baseLayer', newLayer.value)
      };

      return {
        isSelectorOpen,
        baseLayerLocal,
        baseLayerOptions,
        onChangeLayerBase
      }
    }
  }
</script>
