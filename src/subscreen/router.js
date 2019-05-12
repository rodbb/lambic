import Vue from 'vue'
import Router from 'vue-router'
import ScreenSelect from './views/ScreenSelect.vue'
import SubScreen from './views/SubScreen.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'screen-select',
      component: ScreenSelect
    },
    {
      path: '/:id',
      name: 'subscreen',
      component: SubScreen,
      props: true
    }
  ]
})
