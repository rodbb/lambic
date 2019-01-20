<template>
  <v-app>
    <v-navigation-drawer app>
      <v-list>
        <v-list-tile>
          <v-list-tile-title class="title">
            Lambic
          </v-list-tile-title>
        </v-list-tile>
        <v-divider></v-divider>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar app color="light-green">
      <v-toolbar-side-icon></v-toolbar-side-icon>
    </v-toolbar>
    <v-content>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer app></v-footer>
  </v-app>
</template>
