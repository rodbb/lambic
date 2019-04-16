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

export default {
  data () {
    return {
      // FirebaseUIの設定値
      config: {
        signInSuccessUrl: 'event',
        signInOptions: [
          // 表示する認証バナーリスト
          firebase.auth.GithubAuthProvider.PROVIDER_ID
        ],
        tosUrl: '<your-tos-url>'
      }
    }
  },
  mounted () {
    var ui = new firebaseui.auth.AuthUI(firebase.auth())
    ui.start('#firebaseui-auth-container', this.config)
  },
  computed: {
    user () {
      return this.$store.getters.user
    }
  },
  beforeCreate () {
    firebase
      .auth()
      .onAuthStateChanged((user) => {
        if (user) {
          // ユーザ情報をセット
          this.$store.dispatch('setUser', user)
        }
      })
    this.$store.dispatch('initStore')
  },
  created () {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.authUser = user
      } else {
        this.authUser = {}
      }
    })
  },
  methods: {
    // ログイン処理
    doLogin () {
      const provider = new firebase.auth.GithubAuthProvider()
      firebase.auth().signInWithPopup(provider).catch(function (error) {
        console.log(error)
      })
    }
  }
}
</script>
