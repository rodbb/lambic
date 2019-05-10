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
  const user = store.getters.user
  // 権限情報の更新
  if (user !== null && user.isAdmin) {
    // ドキュメント読み取り数削減のため、管理者のみ権限を確認し、必要な場合更新する
    store.dispatch('updatePermission', user.id)
  }
  // 権限による表示制御
  if (to.matched.some(record => record.meta.needsAdmin) &&
    (user === null || !user.isAdmin)) {
    // 権限がない場合
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
