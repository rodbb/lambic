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
const events = firestore.collection('events')
const presentations = firestore.collection('presentations')
const comments = firestore.collection('comments')
const stamps = firestore.collection('stamps')
const stampCounts = firestore.collection('stampCounts')

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    user: null,
    events: [],
    presentations: [],
    comments: [],
    stamps: [],
    stampCounts: []
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
              .filter((cm) => cm.presentationId === pr.id),
            stamps: getters.stamps
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
    user (state) {
      return state.user
    },
    stamps (state, getters) {
      return state.stamps
        .map((st) => {
          return {
            ...st,
            id: st.id
          }
        })
        .sort((a, b) => a.order - b.order)
    },
    stampCounts (state, getters) {
      return state.stampCounts
        .map((sc) => {
          return {
            ...sc,
            id: sc.id
          }
        })
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
    stampCount (state, getters) {
      return (pId, sId) => getters.stampCounts
        .find((e) => e.presentationId === pId && e.stampId === sId)
    }
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    },
    countUpStamp (state, payload) {
      state.presentations.find((e) => e.id === payload.presentationId).stampCounts = payload.stampCounts
    },
    ...firebaseMutations
  },
  actions: {
    initStore: firebaseAction(({ bindFirebaseRef }) => {
      bindFirebaseRef('users', users)
      bindFirebaseRef('events', events)
      bindFirebaseRef('presentations', presentations)
      bindFirebaseRef('comments', comments)
      bindFirebaseRef('stamps', stamps)
      bindFirebaseRef('stampCounts', stampCounts)
    }),
    login ({ commit }, auth) {
      const userDoc = users.doc(auth.uid)
      userDoc
        .get()
        .then((authUserInfo) => {
          if (authUserInfo.exists) {
            commit('setUser', {
              id: authUserInfo.id,
              name: authUserInfo.data().name,
              photoURL: authUserInfo.data().photoURL
            })
          } else {
            userDoc
              .set({
                name: auth.displayName,
                photoURL: auth.photoURL
              })
            commit('setUser', {
              id: auth.uid,
              name: auth.displayName,
              photoURL: auth.photoURL
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
    countUpStamp ({ commit }, { presentationId, stampId }) {
      const stampCount = this.getters.stampCount(presentationId, stampId)
      let promise = new Promise((resolve) => resolve(stampCount))
      if (!stampCount) {
        promise = stampCounts.add({
          presentationId: presentationId,
          stampId: stampId,
          count: 0
        })
      }
      promise.then((added) => {
        const stampCountDoc = stampCounts.doc(added.id)
        stampCountDoc
          .get()
          .then(() => {
            stampCountDoc.update({
              count: firebase.firestore.FieldValue.increment(1)
            })
          })
      })
    }
  }
})
