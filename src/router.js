import Vue from 'vue'
import Router from 'vue-router'
import EventDetail from './views/EventDetail.vue'
import PresentationDetail from './views/PresentationDetail.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/events',
      name: 'home'
    },
    {
      path: '/events/:id',
      name: 'eventDetail',
      component: EventDetail,
      props: true
    },
    {
      path: '/presentations/:id',
      name: 'presentationDetail',
      component: PresentationDetail,
      props: true
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    }
  ]
})
