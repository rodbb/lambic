import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vuetify from 'vuetify'
import VueQriously from 'vue-qriously'
import moment from 'moment'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vuetify/dist/vuetify.min.css'
// import './registerServiceWorker'

moment.locale('ja', {
  weekdaysShort: ['日', '月', '火', '水', '木', '金', '土']
})

Vue.use(Vuetify, {
  theme: {
    primary: '#8BC34A',
    secondary: '#4CAF50',
    accent: '#FF9800',
    error: '#FF5722',
    warning: '#2196f3',
    info: '#DCEDC8',
    success: '#43A047'
  }
})
Vue.use(VueQriously)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
