import Vue from 'vue'
import Vuex from 'vuex'
import { firebaseMutations, firebaseAction } from 'vuexfire'
import firebase from 'firebase/app'
import FirebaseConfig from '../firebase-config.json'
import 'firebase/firestore'
import moment from 'moment'

const firebaseApp = firebase.initializeApp(FirebaseConfig)
const firestore = firebaseApp.firestore()
firestore.settings({})

const users = firestore.collection('users')
const permissions = firestore.collection('permissions')
const events = firestore.collection('events')
const presentations = firestore.collection('presentations')
const comments = firestore.collection('comments')
const screens = firestore.collection('screens')
Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    user: null,
    events: [],
    presentations: [],
    comments: [],
    screens: []
  },
  getters: {
    events (state, getters) {
      return state.events
        .map((ev) => {
          return {
            ...ev,
            id: ev.id,
            date: ev.date.toDate(),
            presentations: getters.presentations
              .filter((pr) => pr.eventId === ev.id)
          }
        })
        .sort((a, b) => {
          // 開催日時の降順にソート
          return !moment(a.date).isSame(b.date)
            ? (moment(a.date).isAfter(b.date) ? -1 : 1)
            : 0
        })
    },
    presentations (state, getters) {
      return state.presentations
        .map((pr) => {
          return {
            ...pr,
            id: pr.id,
            comments: getters.comments
              .filter((cm) => cm.presentationId === pr.id)
          }
        })
    },
    comments (state) {
      return state.comments
        .map((cm) => {
          return {
            ...cm,
            id: cm.id,
            postedAt: cm.postedAt.toDate()
          }
        })
        .sort((a, b) => {
          // 投稿日時の昇順にソート
          return !moment(a.postedAt).isSame(b.postedAt)
            ? (moment(a.postedAt).isAfter(b.postedAt) ? 1 : -1)
            : 0
        })
    },
    screens (state) {
      return state.screens
    },
    user (state) {
      return state.user
    },
    event (state, getters) {
      return (id) => getters.events.find((e) => e.id === id)
    },
    presentation (state, getters) {
      return (id) => getters.presentations.find((e) => e.id === id)
    },
    comment (state, getters) {
      return (id) => getters.comments.find((e) => e.id === id)
    },
    screen (state, getters) {
      return (id) => getters.screens.find((e) => e.id === id)
    }
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    },
    setUserIsAdmin (state, payload) {
      state.user.isAdmin = payload
    },
    ...firebaseMutations
  },
  actions: {
    initStore: firebaseAction(({ bindFirebaseRef }) => {
      bindFirebaseRef('users', users)
      bindFirebaseRef('events', events)
      bindFirebaseRef('presentations', presentations)
      bindFirebaseRef('comments', comments)
      bindFirebaseRef('screens', screens)
    }),
    login ({ commit }, auth) {
      const userDoc = users.doc(auth.uid)
      userDoc
        .get()
        .then((authUserInfo) => {
          if (authUserInfo.exists) {
            // 登録済みユーザの場合
            // 権限情報の取得
            permissions
              .doc(authUserInfo.id)
              .get()
              .then(function (permissionInfo) {
                const isAdmin = permissionInfo.exists ? permissionInfo.data().isAdmin : false
                commit('setUser', {
                  id: authUserInfo.id,
                  name: authUserInfo.data().name,
                  photoURL: authUserInfo.data().photoURL,
                  isAdmin: isAdmin
                })
              })
          } else {
            // 未登録ユーザの場合
            userDoc
              .set({
                name: auth.displayName,
                photoURL: auth.photoURL
              })
            commit('setUser', {
              id: auth.uid,
              name: auth.displayName,
              photoURL: auth.photoURL,
              isAdmin: false
            })
          }
        }).catch((error) => {
          console.log('Error getting document:', error)
        })
    },
    logout ({ commit }) {
      commit('setUser', null)
    },
    /*
     * ユーザの権限情報を更新する
     */
    updatePermission ({ commit }, userId) {
      const permissionDoc = permissions.doc(userId)
      permissionDoc
        .get()
        .then((permission) => {
          if (permission.exists) {
            commit('setUserIsAdmin', permission.data().isAdmin)
          } else {
            commit('setUserIsAdmin', false)
          }
        })
    },
    /*
     * 発表を新規登録する
     */
    addPresentation ({ state }, { eventId, title, description, isAllowComment }) {
      presentations.add({
        eventId,
        title,
        description,
        isAllowComment,
        presenter: users.doc(state.user.id)
      })
    },
    /*
     * 発表を更新する
     */
    updatePresentation ({ state }, { presentationId, eventId, title, description, isAllowComment }) {
      presentations.doc(presentationId).update({
        eventId,
        title,
        description,
        isAllowComment,
        presenter: users.doc(state.user.id)
      })
    },
    /*
     * 発表を削除する
     */
    deletePresentation ({ state }, presentationId) {
      presentations.doc(presentationId).delete()
    },
    /*
     * コメントを登録する
     */
    appendComment ({ state }, { comment, presentationId }) {
      comments.add({
        comment,
        postedAt: firebase.firestore.Timestamp.fromDate(new Date()),
        presentationId,
        userRef: users.doc(state.user.id)
      })
    },
    /*
     * screenドキュメントの表示中プレゼンテーションを更新する
     */
    updateScreenPresentation ({ state }, { screenId, presentationId }) {
      screens.doc(screenId).update({
        displayPresentationRef: presentations.doc(presentationId)
      })
    },
    /*
     * screenドキュメントの表示中プレゼンテーションを削除する
     */
    unsetScreenPresentation ({ state }, screenId) {
      screens.doc(screenId).update({
        displayPresentationRef: null
      })
    }
  }
})
