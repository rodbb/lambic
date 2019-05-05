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

router.beforeEach((to, from, next) => {
  // 権限による表示制御
  const user = store.getters.user
  if (to.matched.some(record => record.meta.needsAdmin) &&
    (user === null || !user.isAdmin)) {
    next({ name: 'error' })
  } else {
    next()
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
