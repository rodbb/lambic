import Vue from 'vue'
import Vuex from 'vuex'
import { vuexfireMutations, firestoreAction } from 'vuexfire'
import firebase from 'firebase/app'
import FirebaseConfig from '../firebase-config.json'
import 'firebase/firestore'

const firebaseApp = firebase.initializeApp(FirebaseConfig)
const firestore = firebaseApp.firestore()
firestore.settings({})

const users = firestore.collection('users')
const permissions = firestore.collection('permissions')

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    user: null
  },
  getters: {
    user (state) {
      return state.user
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
    ...vuexfireMutations
  },
  actions: {
    initStore: firestoreAction(({ bindFirestoreRef }) => {
      bindFirestoreRef('users', users)
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
    }
  }
})
