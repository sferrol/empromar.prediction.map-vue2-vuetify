<template>
  <v-app>
    <v-main>
      <HomeVuetify/>
    </v-main>
  </v-app>
</template>

<script>
  import HomeVuetify from './view/HomeVuetify.vue';

  export default {
    name: 'App',

    components: {
      HomeVuetify,
    },

    data: () => ({
    //
    }),
  };
</script>
