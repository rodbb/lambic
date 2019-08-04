import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vuetify/dist/vuetify.min.css'
import VueQriously from 'vue-qriously'
// import './registerServiceWorker'
import firebase from 'firebase/app'
import FirebaseConfig from '@/../firebase-config.json'

firebase.initializeApp(FirebaseConfig)

Vue.use(Vuetify)
Vue.use(VueQriously)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
