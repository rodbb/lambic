import Vue from 'vue'
import Vuex from 'vuex'
import { vuexfireMutations, firestoreAction } from 'vuexfire'
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
    screens: [],
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
              .filter((cm) => cm.presentationId === pr.id),
            stamps: getters.stamps
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
    screen (state, getters) {
      return (id) => getters.screens.find((e) => e.id === id)
    },
    count (state) {
      return (stampId) => state.counts.find((c) => c.stampId === stampId)
    }
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    },
    updateUserInfo (state, payload) {
      state.user = Object.assign({}, state.user, payload)
    },
    setUserIsAdmin (state, payload) {
      state.user.isAdmin = payload
    },
    clearCounts (state) {
      state.counts.splice(0, state.counts.length)
    },
    setCount (state, payload) {
      const idx = state.counts.findIndex((c) => c.stampId === payload.stampId)
      if (idx !== -1) {
        state.counts.splice(idx, 1, payload)
      } else {
        state.counts.push(payload)
      }
    },
    ...vuexfireMutations
  },
  actions: {
    initStore: firestoreAction(({ bindFirestoreRef }) => {
      bindFirestoreRef('users', users)
      bindFirestoreRef('events', events)
      bindFirestoreRef('presentations', presentations)
      bindFirestoreRef('comments', comments)
      bindFirestoreRef('screens', screens)
      bindFirestoreRef('stamps', stamps)
      bindFirestoreRef('stampCounts', stampCounts)
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
            const registUserName = auth.displayName ? auth.displayName : auth.email.substr(0, auth.email.indexOf('@'))
            userDoc
              .set({
                name: registUserName,
                photoURL: auth.photoURL
              })
            commit('setUser', {
              id: auth.uid,
              name: registUserName,
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
     * ユーザ情報を更新する
     */
    updateUserInfo ({ getters, commit }, userInfo) {
      users.doc(getters.user.id).update(userInfo)
      commit('updateUserInfo', userInfo)
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
     * イベントを登録する
     */
    appendEvent ({ state }, eventInfo) {
      events.add({
        title: eventInfo.title,
        description: eventInfo.description,
        date: firebase.firestore.Timestamp.fromDate(eventInfo.date)
      })
    },
    /*
     * イベントを更新する
     */
    updateEvent ({ state }, { eventId, eventInfo }) {
      events.doc(eventId)
        .update({
          title: eventInfo.title,
          description: eventInfo.description,
          date: firebase.firestore.Timestamp.fromDate(eventInfo.date)
        })
    },
    /*
     * イベントを削除する
     */
    deleteEvent ({ state }, eventId) {
      const batch = firestore.batch()
      // 発表数確認
      presentations.where('eventId', '==', eventId)
        .get()
        .then((presentationSnapshotList) => {
          if (presentationSnapshotList.docs.length === 0) {
            batch.delete(events.doc(eventId))
          }
          batch.commit()
        })
    },
    /*
     * 発表を新規登録する
     * @params { state }
     * @params presentationInfo
     */
    addPresentation ({ state }, presentationInfo) {
      new Promise((resolve) => {
        const batch = firestore.batch()
        // 発表を追加する ///////////////////////////////////////////////////
        const newPresentationDoc = presentations.doc()
        batch.set(newPresentationDoc, {
          ...presentationInfo,
          presenter: users.doc(state.user.id)
        })

        // スタンプカウントを追加する ////////////////////////////////////////
        // 有効なスタンプの数だけ追加
        stamps.where('canUse', '==', true)
          .get() // 現在有効なスタンプを取得
          .then((canUseStamps) => {
            canUseStamps.forEach((stampDoc) => {
              const stampCountDoc = stampCounts.doc()
              batch.set(stampCountDoc, {
                presentationId: newPresentationDoc.id,
                stampId: stampDoc.id,
                shardNum: process.env.VUE_APP_STAMP_COUNT_SHARD_NUM
              })

              // スタンプカウントにshardsサブコレクションを追加する ////////////////
              const stampCountShards = stampCountDoc.collection('shards')
              for (let idx = 0; idx < process.env.VUE_APP_STAMP_COUNT_SHARD_NUM; idx++) {
                batch.set(stampCountShards.doc(idx.toString()), {
                  count: 0
                })
              }
            }) // End forEach
            resolve(batch)
          })
      })
        .then((batch) => {
          batch.commit()
        })
    },
    /*
     * 発表を更新する
     */
    updatePresentation ({ state }, { presentationId, presentationInfo }) {
      presentations.doc(presentationId).update({
        ...presentationInfo,
        presenter: users.doc(state.user.id)
      })
    },
    /*
     * 発表を削除する
     */
    deletePresentation ({ state }, presentationId) {
      const batch = firestore.batch()
      // スタンプカウント削除
      stampCounts.where('presentationId', '==', presentationId)
        .get()
        .then((stampCountSnapshotList) => {
          stampCountSnapshotList.forEach((stampCountSnapshot) => {
            // shardsサブコレクション内ドキュメント削除
            stampCountSnapshot.ref.get().then((stampCount) => {
              const shardNum = stampCount.data().shardNum
              for (let idx = 0; idx < shardNum; idx++) {
                batch.delete(stampCountSnapshot.ref.collection('shards').doc(idx.toString()))
              }
            })
            // スタンプカウントドキュメント削除
            batch.delete(stampCountSnapshot.ref)
          })
          // コメント削除
          comments.where('presentationId', '==', presentationId)
            .get()
            .then((commentSnapshotList) => {
              commentSnapshotList.forEach((commentSnapshot) => {
                batch.delete(commentSnapshot.ref)
              })
              // 発表削除
              batch.delete(presentations.doc(presentationId))
              batch.commit()
            })
        })
    },
    /*
     * コメントを登録する
     */
    appendComment ({ state }, { comment, presentationId, isDirect }) {
      comments.add({
        comment,
        postedAt: firebase.firestore.Timestamp.fromDate(new Date()),
        presentationId,
        isDirect,
        userRef: users.doc(state.user.id)
      })
    },
    /*
     * コメントを編集する
     */
    updateComment ({ state }, { comment, isDirect, commentId }) {
      comments.doc(commentId)
        .update({
          comment,
          isDirect
        })
    },
    /*
     * コメントを削除する
     */
    deleteComment ({ state }, { commentId }) {
      comments.doc(commentId).delete()
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
    },
    clearCounts ({ commit }) {
      commit('clearCounts')
    },
    watchStampCount ({ commit }, { presentationId }) {
      // サブコレクションに対するbindFirestoreRefの適用方法が不明なため、
      // shardsの監視処理は自前で実装
      let unsubscribes = []
      stampCounts
        .where('presentationId', '==', presentationId)
        .get()
        .then((query) => {
          query.docs.forEach((stampCount) => {
            // サブコレクション`shards`を監視し、変更があれば再計算の上stateに反映する
            const stampCountRef = stampCounts.doc(stampCount.id)
            unsubscribes.push(stampCountRef.collection('shards').onSnapshot((querySnapshot) => {
              querySnapshot.docChanges().forEach((docChange) => {
                if (docChange.type === 'added' || docChange.type === 'modified') {
                  stampCountRef.collection('shards').get().then((snap) => {
                    let totalCount = 0
                    snap.forEach((doc) => {
                      totalCount += doc.data().count
                    })
                    commit('setCount', {
                      stampId: stampCount.data().stampId,
                      count: totalCount
                    })
                  })
                }
              })
            }))
          })
        })
      return unsubscribes
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
