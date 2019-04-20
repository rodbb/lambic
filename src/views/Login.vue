<template>
  <div>
    <v-layout justify-center>
      <v-card-title>
        <h1 class="headline mb-0">ログイン</h1>
      </v-card-title>
    </v-layout>
    <div id="firebaseui-auth-container"></div>
  </div>
</template>

<script>
import firebase from 'firebase'
import firebaseui from 'firebaseui-ja'
import 'firebaseui-ja/dist/firebaseui.css'

export default {
  data () {
    return {
      // FirebaseUIの設定値
      config: {
        signInSuccessUrl: '/',
        signInOptions: [
          // 表示する認証バナーリスト
          firebase.auth.GithubAuthProvider.PROVIDER_ID
        ],
        tosUrl: '' // 利用規約のURLを指定
      }
    }
  },
  mounted () {
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth())
    ui.start('#firebaseui-auth-container', this.config)
  },
  beforeCreate () {
    firebase
      .auth()
      .onAuthStateChanged((user) => {
        if (user) {
          // ユーザ情報をセット
          this.$store.dispatch('login', user)
        }
      })
  }
}
</script>
