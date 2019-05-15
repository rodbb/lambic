import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/Login.vue'
import MyPage from './views/MyPage.vue'
import EventList from './views/EventList.vue'
import EventDetail from './views/EventDetail.vue'
import PresentationDetail from './views/PresentationDetail.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/events'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/myPage',
      name: 'myPage',
      component: MyPage
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
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
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
