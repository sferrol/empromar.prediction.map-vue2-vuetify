<template>
  <v-card>
    <v-navigation-drawer
      :value="isSidebarActive"
      :temporary="false"
      touchless
      :right="!$vuetify.rtl"
      :width="$vuetify.breakpoint.smAndUp ? '280px' : '100%'"
      app
      @input="(val) => $emit('update:isSidebarActive', val)"
    >
      <template v-slot:prepend>
        <div class="d-flex align-center">
          <v-list-item two-line>
            <v-list-item-avatar>
              <img src="https://randomuser.me/api/portraits/women/81.jpg">
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>Jane Smith</v-list-item-title>
              <v-list-item-subtitle>Logged In</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <!-- Close -->
          <v-btn
            icon
            small
            @click="$emit('update:is-sidebar-active',false)"
          >
            <v-icon size="22">mdi-close</v-icon>
          </v-btn>
        </div>
      </template>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item
          v-for="item in items"
          :key="item.title"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-card>
</template>

<script>
  import { ref, watch } from 'vue';

  export default {
    props: {
      isSidebarActive: {
        type: Boolean,
        required: true,
      },
    },
    setup (props) {

      const isVisibleLocal = ref(props.isVisible)
      watch( () => props.isVisible, () => {
        isVisibleLocal.value = props.isVisible
      })
      return {
        isVisibleLocal,
        items: [
          { title: 'Home', icon: 'mdi-home-city' },
          { title: 'My Account', icon: 'mdi-account' },
          { title: 'Users', icon: 'mdi-account-group-outline' },
        ],
      }
    },
  }
</script>
