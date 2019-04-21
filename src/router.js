import Vue from 'vue'
import Router from 'vue-router'
import EventList from './views/EventList.vue'
import EventDetail from './views/EventDetail.vue'
import PresentationDetail from './views/PresentationDetail.vue'
import AdminScreenSetting from './views/AdminScreenSetting.vue'
import AdminScreenList from './views/AdminScreenList.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/events'
    },
    {
      path: '/events/:id',
      name: 'eventDetail',
      component: EventDetail,
      props: true
    },
    {
      path: '/events',
      name: 'eventList',
      component: EventList
    },
    {
      path: '/presentations/:id',
      name: 'presentationDetail',
      component: PresentationDetail,
      props: true
    },
    {
      path: '/screens',
      name: 'adminScreenList',
      component: AdminScreenList
    },
    {
      path: '/screens/:id',
      name: 'adminScreenSetting',
      component: AdminScreenSetting,
      props: true
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
