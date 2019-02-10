<template>
  <v-app>
    <v-navigation-drawer app fixed v-model="permanent">
      <v-list>
        <v-list-tile>
          <v-list-tile-title class="title">
            <router-link :to="{ name: 'home' }">Lambic</router-link>
          </v-list-tile-title>
        </v-list-tile>
        <v-divider></v-divider>
      </v-list>
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
export default {
  name: 'app',
  data () {
    return {
      permanent: false
    }
  }
}
</script>
