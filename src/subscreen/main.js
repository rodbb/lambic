import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vuetify/dist/vuetify.min.css'
// import './registerServiceWorker'
import firebase from 'firebase/app'
import FirebaseConfig from '@/../firebase-config.json'

firebase.initializeApp(FirebaseConfig)

Vue.use(Vuetify)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
