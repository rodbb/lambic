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

Vue.use(Vuetify)
Vue.use(VueQriously)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
