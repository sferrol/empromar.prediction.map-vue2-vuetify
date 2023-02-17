<template>
  <div class="d-flex align-center" style="height: 56px;">
    <!-- offset-y + top:Hacia arriba en XS  or bottom: Hacia abajo en XS -->
    <v-menu
      transition="scale-transition"
      origin="center center"
      v-model="isToxinTypeOpen"
      open-on-hover
      offset-y
      :top="$vuetify.breakpoint.xs"
      :bottom="!$vuetify.breakpoint.xs"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-on="on"
          v-bind="attrs"
          v-model="isToxinTypeOpen"
          small
          fab
          :loading="loading"
          :color="(toxinTypeSelected && toxinTypeSelected.color) || 'blue darken-2'"
        >
          <v-icon v-if="isToxinTypeOpen">
            mdi-close
          </v-icon>
          <span v-else>{{ toxinTypeSelected ? toxinTypeSelected.value : '??' }}</span>
        </v-btn>
      </template>

      <!-- <div class="d-flex flex-column" :class="[$vuetify.breakpoint.xs ? 'mb-12' : 'mt-12']"> -->
      <div class="d-flex flex-column">
        <!-- @click="toxinTypeSelected = item" -->
        <v-btn
          class="my-2"
          v-for="(item, index) in toxinTypeOptions"
          :key="index"
          v-show="toxinTypeSelected && toxinTypeSelected.value !== item.value"
          fab
          small
          :color="item.color"
          @click="$emit('update:toxinTypeSelected', item)"
        >
          {{ item.text }}
        </v-btn>
      </div>
    </v-menu>
  </div>
  <!-- <v-progress-circular color="white" indeterminate :size="35" v-if="loading"></v-progress-circular> -->
  <!-- <div>
      <v-speed-dial
        v-model="isToxinTypeOpen"
        absolute
        right
        top
        small
        direction="bottom"
        open-on-hover
        transition="slide-y-reverse-transition"
      >
        <template v-slot:activator>
          <v-btn
            v-model="isToxinTypeOpen"
            dark
            fab
            :loading="loading"
            :color="(toxinTypeSelected && toxinTypeSelected.color) || 'blue darken-2'"
          >
            <v-icon v-if="isToxinTypeOpen">
              mdi-close
            </v-icon>
            <span v-else>{{ toxinTypeSelected ? toxinTypeSelected.value : '??' }}</span>

          </v-btn>
        </template>
        <v-btn
          v-for="(item, index) in toxinTypeOptions"
          :key="index"
          v-show="toxinTypeSelected && toxinTypeSelected.value !== item.value"
          fab
          small
          :color="item.color"
          @click="$emit('update:toxinTypeSelected', item)"
        >
          {{ item.text }}
        </v-btn>
      </v-speed-dial>
    </div> -->
</template>
<script>
  import { ref } from 'vue';

  export default {
    name: 'forecast-toxin-type',
    props: {
      toxinTypeSelected: {
        type: Object,
        default: () => ({
          value: 'DSP',
          text: 'LIPO',
          color: 'blue',
          image: ''
        }),
      },
      toxinTypeOptions: {
        type: Array,
        default: () => [],
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
    setup() {

      // Only for internal use of control (Change icon when selected)
      const isToxinTypeOpen = ref(false)
      return {
        isToxinTypeOpen
      }
    }
  }
</script>
