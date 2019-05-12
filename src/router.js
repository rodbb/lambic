import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import Login from './views/Login.vue'
import EventList from './views/EventList.vue'
import EventDetail from './views/EventDetail.vue'
import PresentationDetail from './views/PresentationDetail.vue'
import AdminScreenSetting from './views/AdminScreenSetting.vue'
import AdminScreenList from './views/AdminScreenList.vue'
import Error from './views/Error.vue'

Vue.use(Router)

const router = new Router({
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
      component: AdminScreenList,
      meta: { needsAdmin: true }
    },
    {
      path: '/screens/:id',
      name: 'adminScreenSetting',
      component: AdminScreenSetting,
      props: true,
      meta: { needsAdmin: true }
    },
    {
      path: '/error',
      name: 'error',
      component: Error
    },
    {
      path: '/*',
      redirect: '/error'
    }
  ],

  /*
   * 画面表示変更時、スクロール位置を一番上にする
   */
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

/*
 * ナビゲーションガード
 * ルーティングの前処理を行う
 */
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

export default router
