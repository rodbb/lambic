<template>
  <v-app>
    <v-toolbar height="150">
      <v-toolbar-title class="display-4">{{ presentationTitle }}</v-toolbar-title>
    </v-toolbar>
    <v-progress-linear v-if="isLoadong" :indeterminate="isLoadong"></v-progress-linear>
    <v-content v-else>
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
      <v-footer class="pa-3" app>
        <v-spacer></v-spacer>
        <div class="title">{{ screenName }}</div>
      </v-footer>
    </v-content>
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
        presentation: null,
        stamps: null
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
        : '（名称未設定の会場）'
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
      const blinkStmps = this.stamps.map((stmp, idx) => {
        const maybeOldStmpCnt = oldCnt.find((cnt) => cnt.stampId === stmp.id)
        const maybeNewStmpCnt = newCnt.find((cnt) => cnt.stampId === stmp.id)
        if (maybeNewStmpCnt == null) {
          return stmp
        }
        const oldStmpCnt = (maybeOldStmpCnt != null && maybeOldStmpCnt.count != null)
          ? maybeOldStmpCnt.count
          : 0
        const newStmpCnt = maybeNewStmpCnt.count || 0
        const isCntChanged = oldStmpCnt !== newStmpCnt
        if (isCntChanged && stmp.blink && stmp.timer != null) {
          clearTimeout(stmp.timer)
        }
        return {
          ...stmp,
          blink: isCntChanged,
          timer: isCntChanged
            ? setTimeout(() => { this.stamps[idx].blink = false }, 500)
            : null
        }
      })
      this.stamps = blinkStmps
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
                timer: null,
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
