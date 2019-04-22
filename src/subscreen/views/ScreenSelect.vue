<template>
  <v-app>
    <v-toolbar>
      <v-toolbar-title>Select Screen</v-toolbar-title>
    </v-toolbar>
    <v-progress-linear v-if="isLoadong" indeterminate></v-progress-linear>
    <v-container v-else fluid>
      <v-layout row>
        <v-flex v-if="screens.length === 0" class="display-1">会場がありません。</v-flex>
        <v-flex v-else>
          <v-list>
            <v-list-tile v-for="screen in screens" :key="screen.id" :to="{ path: screen.id }">
              <v-list-tile-content>
                <v-list-tile-title class="title">
                  {{ screen.name }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-flex>
      </v-layout>
    </v-container>
  </v-app>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'

export default {
  name: 'select-subscreen',
  data () {
    return {
      isLoadong: true,
      screens: []
    }
  },
  created () {
    const firestore = firebase.firestore()
    const screensRef = firestore.collection('screens')
    screensRef
      .get()
      .then((querySnapshot) => {
        const screens = []
        querySnapshot.forEach((doc) => {
          const d = doc.data()
          screens.push({
            id: doc.id,
            ...d
          })
        })
        this.screens = screens
        this.isLoadong = false
      }).catch((error) => {
        console.log('Error getting collection:', error)
      })
  }
}
</script>
