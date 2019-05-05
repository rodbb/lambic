import Vue from 'vue'
import Vuex from 'vuex'
import { firebaseMutations, firebaseAction } from 'vuexfire'
import firebase from 'firebase/app'
import FirebaseConfig from '../firebase-config.json'
import 'firebase/firestore'

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
            presentations: getters.presentations
              .filter((pr) => pr.eventId === ev.id)
          }
        })
        .sort((a, b) => {
          // 開催日時の降順にソート
          const dsec = a.date.seconds - b.date.seconds
          const dnanosec = a.date.nanoseconds - b.date.nanoseconds
          return dsec === 0 ? (dnanosec < 0) - (dnanosec > 0) : (dsec < 0) - (dsec > 0)
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
        .slice()
        .sort((a, b) => {
          // 投稿日時の昇順にソート
          const dsec = a.postedAt.seconds - b.postedAt.seconds
          const dnanosec = a.postedAt.nanoseconds - b.postedAt.nanoseconds
          return dsec === 0 ? (dnanosec > 0) - (dnanosec < 0) : (dsec > 0) - (dsec < 0)
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
    },
    /*
     * Presentationドキュメントの参照値を返す
     */
    presentationRef (state, getters) {
      return (id) => presentations.doc(id)
    }
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
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
    login ({ commit, getters }, auth) {
      const userDoc = users.doc(auth.uid)
      userDoc
        .get()
        .then((authUserInfo) => {
          if (authUserInfo.exists) {
            // 登録済みユーザの場合
            // 権限情報の取得
            permissions
              .where('userId', '==', authUserInfo.id)
              .get()
              .then(function (querySnapshot) {
                const isAdmin = !querySnapshot.empty ? querySnapshot.docs[0].data().isAdmin : false
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
    appendComment ({ state }, { comment, presentationId }) {
      comments.add({
        comment,
        postedAt: firebase.firestore.Timestamp.fromDate(new Date()),
        presentationId,
        userRef: users.doc(state.user.id)
      })
    },
    /*
     * screenドキュメントを更新する
     */
    updateScreen ({ state }, screenInfo) {
      screens.doc(screenInfo.id).set(screenInfo)
    }
  }
})
