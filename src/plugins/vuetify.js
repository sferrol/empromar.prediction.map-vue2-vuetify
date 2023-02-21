import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
  breakpoint: {
    mobileBreakpoint: 'xs' // default sm: This is equivalent to a value of 960 (xs para < 600)
  },
});
