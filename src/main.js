import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import VueAxios from 'vue-axios'
import { LMap, LTileLayer, LMarker, LIcon, LPopup } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'

// styles
import 'normalize.css/normalize.css'
import '@/assets/scss/style.scss'
import 'vue-multiselect/dist/vue-multiselect.min.css'

import Multiselect from 'vue-multiselect'

Vue.use(VueAxios, axios)
Vue.component('multiselect', Multiselect)
Vue.component('l-map', LMap)
Vue.component('l-tile-layer', LTileLayer)
Vue.component('l-marker', LMarker)
Vue.component('l-icon', LIcon)
Vue.component('l-popup', LPopup)

// this part resolve an issue where the markers would not appear
delete Icon.Default.prototype._getIconUrl

Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
