<template>
  <v-app>
    <v-toolbar>
      <v-toolbar-title>{{ presentationTitle }}</v-toolbar-title>
    </v-toolbar>
    <v-progress-linear v-if="isLoadong" :indeterminate="isLoadong"></v-progress-linear>
    <template v-else>
      <v-container fluid>
        <v-layout row>
          <v-flex v-if="presentation !== null">
            {{ presentationTitle }}
          </v-flex>
          <v-flex v-else>ただいま発表は行われていません。</v-flex>
        </v-layout>
      </v-container>
      <v-footer class="pa-3">
        <v-spacer></v-spacer>
        <div>{{ screenName }}</div>
      </v-footer>
    </template>
  </v-app>
</template>

<script>
import firebase from 'firebase/app'
import 'firebase/firestore'

export default {
  name: 'subscreen',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      isLoadong: true,
      screenInfo: null,
      presentation: null,
      unsubscribe: {
        screenInfo: null,
        presentation: null
      }
    }
  },
  computed: {
    presentationTitle () {
      return (this.presentation !== null && this.presentation.title)
        ? this.presentation.title
        : ''
    },
    screenName () {
      return (this.screenInfo !== null && this.screenInfo.name)
        ? this.screenInfo.name
        : ''
    }
  },
  created () {
    const firestore = firebase.firestore()
    this.unsubscribe.screenInfo =
      firestore.collection('screens')
        .doc(this.id)
        .onSnapshot((screenDoc) => {
          if (this.unsubscribe.presentation !== null) {
            this.unsubscribe.presentation()
            this.presentation = null
          }
          if (!screenDoc.exists) {
            this.isLoadong = false
            return
          }
          this.screenInfo = screenDoc.data()
          if (this.screenInfo.displayPresentationId == null) {
            this.isLoadong = false
            return
          }
          this.unsubscribe.presentation =
            firestore.collection('presentations')
              .doc(this.screenInfo.displayPresentationId)
              .onSnapshot((doc) => {
                if (doc.exists) {
                  this.presentation = doc.data()
                } else {
                  console.log('No such document!')
                }
                this.isLoadong = false
              }, (error) => {
                console.log('Error getting document:', error)
              })
        }, (error) => {
          console.log('Error getting document:', error)
        })
  },
  beforeDestroy () {
    for (const unsubscribe of this.unsubscribe) {
      if (unsubscribe !== null) {
        unsubscribe()
      }
    }
  }
}
</script>
