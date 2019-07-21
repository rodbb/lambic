import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import Login from './views/Login.vue'
import MyPage from './views/MyPage.vue'
import EventList from './views/EventList.vue'
import EventDetail from './views/EventDetail.vue'
import PresentationDetail from './views/PresentationDetail.vue'
import AdminPage from './views/AdminPage.vue'
import AdminScreenSetting from './views/AdminScreenSetting.vue'
import AdminScreenList from './views/AdminScreenList.vue'
import AdminStampSetting from './views/AdminStampSetting.vue'
import AdminStampList from './views/AdminStampList.vue'
import DraftPresentation from './views/DraftPresentation.vue'
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
      path: '/:eventId/draftPresentations/:id',
      name: 'draftPresentation',
      component: DraftPresentation,
      props: true
    },
    {
      path: '/admin',
      name: 'adminPage',
      component: AdminPage,
      meta: { needsAdmin: true }
    },
    {
      path: '/admin/screens',
      name: 'adminScreenList',
      component: AdminScreenList,
      meta: { needsAdmin: true }
    },
    {
      path: '/admin/screens/:id',
      name: 'adminScreenSetting',
      component: AdminScreenSetting,
      props: true,
      meta: { needsAdmin: true }
    },
    {
      path: '/admin/stamps',
      name: 'adminStampList',
      component: AdminStampList,
      meta: { needsAdmin: true }
    },
    {
      path: '/admin/stamps/:id',
      name: 'adminStampSetting',
      component: AdminStampSetting,
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
  if (user !== null && user.isAdmin) {
    // 権限を更新する
    // 裏で管理者権限が剥奪されている可能性があるため、
    // ページ遷移時に権限を更新する必要があるが、
    // 全ての画面遷移時に更新を行うと、ドキュメントの読取りが毎回発生し、
    // 読取り回数が増加するため、
    // ここで、管理者権限が必要なページへ遷移するときのみ権限を更新する。
    store.dispatch('updatePermission', user.id)
  }

  // 権限による表示制御
  if (to.matched.some(record => record.meta.needsAdmin) &&
    (user === null || !user.isAdmin)) {
    // 権限がない場合はエラーページへ遷移
    next({ name: 'error' })
  } else {
    next()
  }
})

export default router
