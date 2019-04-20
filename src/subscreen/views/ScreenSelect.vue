<template>
  <v-app>
    <v-toolbar>
      <v-toolbar-title>Select Screen</v-toolbar-title>
    </v-toolbar>
    <v-container fluid>
      <v-layout row>
        <v-flex>
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
        if (screens.length === 0) {
          const newScreen = screensRef.doc()
          const d = {
            name: 'screenA',
            presentation: null
          }
          newScreen.set(d)
          screens.push({
            id: newScreen.id,
            ...d
          })
        }
        this.screens = screens
      }).catch((error) => {
        console.log('Error getting collection:', error)
      })
  }
}
</script>
