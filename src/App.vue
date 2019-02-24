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
          this.$store.dispatch('setUser', user)
        }
      })
    this.$store.dispatch('initStore')
  },
  created () {
    firebase
      .auth()
      .signInAnonymously()
      .catch((e) => {
        alert(e.message)
      })
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
