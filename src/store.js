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
    stampCounts: [],
    counts: []
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
    stamps (state) {
      return state.stamps
        .map((st) => {
          return {
            ...st,
            id: st.id
          }
        })
        .sort((a, b) => a.order - b.order)
    },
    stampCounts (state) {
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
    count (state) {
      return (stampId) => state.counts.find((c) => c.stampId === stampId)
    }
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    },
    setCount (state, payload) {
      const idx = state.counts.findIndex((c) => c.stampId === payload.stampId)
      if (idx !== -1) {
        state.counts.splice(idx, 1, payload)
      } else {
        state.counts.push(payload)
      }
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
    watchStampCount ({ commit }, { presentationId }) {
      // サブコレクションに対するbindFirebaseRefの適用方法が不明なため、
      // shardsの監視処理は自前で実装
      stampCounts
        .where('presentationId', '==', presentationId)
        .get()
        .then((query) => {
          query.docs.forEach((sc) => {
            // サブコレクション`shards`を監視し、変更があれば再計算の上stateに反映する
            stampCounts.doc(sc.id).collection('shards').onSnapshot((querySnapshot) => {
              querySnapshot.docChanges().forEach((docChange) => {
                if (docChange.type === 'added' || docChange.type === 'modified') {
                  stampCounts.doc(sc.id).collection('shards').get().then((snap) => {
                    let totalCount = 0
                    snap.forEach((doc) => {
                      totalCount += doc.data().count
                    })
                    commit('setCount', {
                      stampId: sc.data().stampId,
                      count: totalCount
                    })
                  })
                }
              })
            })
          })
        })
    },
    countUpStamp ({ commit }, { presentationId, stampId }) {
      const stampCount = this.getters.stampCounts
        .find((e) => e.presentationId === presentationId && e.stampId === stampId)
      if (stampCount) {
        const stampCountDoc = stampCounts.doc(stampCount.id)
        stampCountDoc
          .get()
          .then((scSnap) => {
            // 1回/秒の更新制限を回避するため
            // shardNum個あるshardsのうち、ランダムな1個のカウントをインクリメント
            const shardIdx = Math.floor(Math.random() * scSnap.data().shardNum).toString()
            stampCountDoc.collection('shards').doc(shardIdx).update({
              count: firebase.firestore.FieldValue.increment(1)
            })
          })
      }
    }
  }
})
