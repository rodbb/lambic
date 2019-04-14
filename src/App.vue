<template>
  <v-app>
    <v-navigation-drawer app fixed v-model="permanent">
      <v-toolbar flat>
        <v-list class="py-0">
          <v-list-tile :to="{ name: 'home' }">
            <v-list-tile-title class="title">Lambic</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-toolbar>

      <v-divider></v-divider>

      <v-list dense class="pt-0">

        <v-list-tile v-if="authUser.uid" class="my-2">
          <v-list-tile-avatar>
            <img v-bind:src="authUser.photoURL">
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{ authUser.displayName }}</v-list-tile-title>
            <v-list-tile-sub-title>
              <button type="button" @click="doLogout">ログアウト</button>
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile v-else class="my-2">
          <v-list-tile-avatar>
            <v-icon x-large color="light-green">account_circle</v-icon>
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>ゲストユーザ</v-list-tile-title>
            <v-list-tile-sub-title>
              <button type="button" @click="doLogin">ログイン</button>
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-divider></v-divider>

        <v-list-tile :href="href.issues">
          <v-list-tile-action>
            <v-icon>feedback</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>フィードバック</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-divider></v-divider>
        <v-list-tile v-for="p in presentations" :key="p.id">
          <v-list-tile-content>
            <v-list-tile-title>
              <router-link :to="{ name: 'presentationDetail', params: { id: p.id }}">{{ p.title }}</router-link>
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>

      <qriously id="qrcode" class="pb-4" :value="href.here" :size="150"/>
    </v-navigation-drawer>
    <v-toolbar app color="light-green">
      <v-toolbar-side-icon @click="permanent = !permanent"></v-toolbar-side-icon>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/auth'

export default {
  name: 'app',
  data () {
    return {
      authUser: {},
      permanent: false
    }
  },
  computed: {
    href () {
      return {
        here: `${window.location.origin}/#${this.$route.path}`,
        issues: process.env.VUE_APP_ISSUES_URL
      }
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
    },
    // ログアウト処理
    doLogout () {
      if (confirm('ログアウトしますか？')) {
        firebase.auth().signOut()
      }
    }
  }
}
</script>

<style scoped>
#qrcode {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>
