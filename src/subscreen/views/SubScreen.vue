<template>
  <v-app>
    <v-toolbar>
      <v-toolbar-title>{{ presentationTitle }}</v-toolbar-title>
    </v-toolbar>
    <v-progress-linear v-if="isLoadong" :indeterminate="isLoadong"></v-progress-linear>
    <template v-else>
      <v-container fluid>
        <v-layout
          row
          fill-height
          align-center
          justify-center
        >
          <v-flex v-if="presentation === null" class="display-1">ただいま発表は行われていません。</v-flex>
          <v-flex v-else-if="stamps.length === 0" class="display-1">準備中...</v-flex>
          <template v-else>
            <v-flex
              v-for="stamp in stamps"
              :key="stamp.id"
              xs4
              d-flex
            >
              <v-card flat tile class="d-flex">
                <img
                  :src="stamp.src || ''"
                  :alt="stamp.string"
                  :class="['lighten-2', 'display-4', 'text-xs-center', {'blinking': stamp.blink}]"
                >
              </v-card>
            </v-flex>
          </template>
        </v-layout>
      </v-container>
      <v-footer class="pa-3">
        <v-spacer></v-spacer>
        <div class="title">{{ screenName }}</div>
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
      stamps: [],
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
  watch: {
    presentation (newP, oldP) {
      if (newP == null || oldP == null || newP.stampCounts == null) {
        return
      }
      const newCnt = newP.stampCounts
      const oldCnt = oldP.stampCounts || newCnt.map((p) => {
        return {
          ...p,
          count: 0
        }
      })
      const blinkStmps = this.stamps.map((stmp) => {
        const maybeOldStmpCnt = oldCnt.find((cnt) => cnt.stampId === stmp.id)
        const maybeNewStmpCnt = newCnt.find((cnt) => cnt.stampId === stmp.id)
        if (maybeNewStmpCnt == null) {
          return stmp
        }
        const oldStmpCnt = (maybeOldStmpCnt != null && maybeOldStmpCnt.count != null)
          ? maybeOldStmpCnt.count
          : 0
        const newStmpCnt = maybeNewStmpCnt.count || 0
        return {
          ...stmp,
          blink: oldStmpCnt !== newStmpCnt
        }
      })
      this.stamps = blinkStmps
      setTimeout(() => {
        this.stamps = blinkStmps.map((stmp) => {
          return {
            ...stmp,
            blink: false
          }
        })
      }, 500)
    }
  },
  created () {
    const firestore = firebase.firestore()
    this.unsubscribe.screenInfo =
      firestore.collection('screens')
        .doc(this.id)
        .onSnapshot((screenDoc) => {
          if (this.unsubscribe.presentation != null) {
            this.unsubscribe.presentation()
            this.presentation = null
          }
          if (!screenDoc.exists) {
            this.isLoadong = false
            return
          }
          this.screenInfo = screenDoc.data()
          if (this.screenInfo.displayPresentationRef == null) {
            this.isLoadong = false
            return
          }
          this.unsubscribe.presentation =
            this.screenInfo.displayPresentationRef
              .onSnapshot((doc) => {
                if (doc.exists) {
                  this.presentation = doc.data()
                } else {
                  console.log('No such document!')
                }
                this.isLoadong = false
              })
        }, (error) => {
          console.log('Error getting document:', error)
        })
    this.unsubscribe.stamps =
      firestore.collection('stamps')
        .orderBy('order')
        .onSnapshot((querySnapshot) => {
          const stamps = []
          querySnapshot
            .forEach((doc) => {
              const d = doc.data()
              stamps.push({
                id: doc.id,
                blink: false,
                ...d
              })
            })
          this.stamps = stamps
        }, (error) => {
          console.log('Error getting collection:', error)
        })
  },
  beforeDestroy () {
    Object.values(this.unsubscribe)
      .filter((e) => e != null)
      .forEach((unsubscribe) => {
        unsubscribe()
      })
  }
}
</script>

<style scoped>
.blinking{
    animation:blink 0.2s ease-in-out infinite alternate;
}
@keyframes blink{
    0% {opacity:0;}
    100% {opacity:1;}
}
</style>
