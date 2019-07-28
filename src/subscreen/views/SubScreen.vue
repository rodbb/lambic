<template>
  <v-app>
    <v-toolbar height="80" extended>
      <v-toolbar-title class="display-3">{{ presentationTitle }}</v-toolbar-title>
      <template v-slot:extension>
        <div class="display-2 text-truncate">{{ presenterName }}</div>
      </template>
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
                  :class="['lighten-2', 'display-4', 'text-xs-center', 'max-w300', 'max-h300', {'blinking': stamp.blink, 'grayscale100': !stamp.canUse }]"
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
      stampCounts: [],
      unsubscribe: {
        screenInfo: null,
        presentation: null,
        stamps: [],
        stampCounts: []
      }
    }
  },
  computed: {
    presentationTitle () {
      return (this.presentation !== null && this.presentation.title)
        ? this.presentation.title
        : ''
    },
    presenterName () {
      return (this.presentation !== null && this.presentation.presenter != null)
        ? this.presentation.presenter.name
        : ''
    },
    screenName () {
      return (this.screenInfo !== null && this.screenInfo.name)
        ? this.screenInfo.name
        : '（名称未設定の会場）'
    }
  },
  watch: {
    /**
     * スタンプのカウントを監視し、変更があれば該当スタンプを点滅させる
     * @param newSC
     * @param oldSC
     */
    stampCounts (newSC, oldSC) {
      // 表示する発表が切り替わったときはデータが出そろうまで点滅させない
      if (newSC.length !== oldSC.length) {
        return
      }
      this.stamps = this.stamps.map((stmp, idx) => {
        const maybeOldStmpCnt = oldSC.find((cnt) => cnt.stampId === stmp.id)
        const maybeNewStmpCnt = newSC.find((cnt) => cnt.stampId === stmp.id)
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
    }
  },
  created () {
    // 各ドキュメントの変更を監視するリスナを設定
    const firestore = firebase.firestore()
    // screenのリスナを設定
    this.unsubscribe.screenInfo =
      firestore.collection('screens')
        .doc(this.id)
        .onSnapshot((screenDoc) => {
          // 表示する発表が切り替わった時の初期化処理
          if (this.unsubscribe.presentation != null) {
            this.unsubscribe.presentation()
            this.presentation = null
          }
          if (this.unsubscribe.stampCounts !== []) {
            this.unsubscribe.stampCounts.forEach((u) => u())
            this.stampCounts = []
          }
          // 表示する発表が取得できない場合は後続のリスナの設定不要
          if (!screenDoc.exists) {
            this.isLoadong = false
            return
          }
          this.screenInfo = screenDoc.data()
          if (this.screenInfo.displayPresentationRef == null) {
            this.isLoadong = false
            return
          }
          // presentationのリスナを設定
          this.unsubscribe.presentation =
            this.screenInfo.displayPresentationRef
              .onSnapshot(async (doc) => {
                if (doc.exists) {
                  const presentation = doc.data()
                  const presenter = await presentation.presenter.get()
                  this.presentation = {
                    ...presentation,
                    presenter: presenter.exists ? presenter.data() : null
                  }
                } else {
                  console.log('No such document!')
                }
                this.isLoadong = false
              })
          // shardsのリスナを設定
          const stampCounts = firestore.collection('stampCounts')
          stampCounts
            .where('presentationId', '==', this.screenInfo.displayPresentationRef.id)
            .get()
            .then((query) => {
              query.docs.forEach((stampCountSnap) => {
                this.unsubscribe.stampCounts.push(stampCounts.doc(stampCountSnap.id).collection('shards').onSnapshot(() => {
                  stampCounts.doc(stampCountSnap.id).collection('shards').get().then((snap) => {
                    let totalCount = 0
                    snap.forEach((doc) => {
                      totalCount += doc.data().count
                    })
                    const stampId = stampCountSnap.data().stampId
                    const data = { stampId: stampId, count: totalCount }
                    // cloneした配列に対して変更し、元配列を上書きする
                    // 単純に元配列を変更すると、更新前後で同じオブジェクトを参照し、差分が取れないため
                    let stampCounts = []
                    this.stampCounts.forEach((stampCount) => {
                      stampCounts.push(JSON.parse(JSON.stringify(stampCount)))
                    })
                    const idx = stampCounts.findIndex((c) => c.stampId === stampId)
                    if (idx !== -1) {
                      stampCounts.splice(idx, 1, data)
                    } else {
                      stampCounts.push(data)
                    }
                    this.stampCounts = stampCounts
                  })
                }))
                stampCounts
                  .doc(stampCountSnap.id)
                  .get()
                  .then((stampCount) => {
                    if (!stampCount.exists) {
                      return
                    }
                    // stampsのリスナを設定
                    this.unsubscribe.stamps.push(firestore.collection('stamps')
                      .doc(stampCount.data().stampId)
                      .onSnapshot((docSnapshot) => {
                        this.stamps.push({
                          id: docSnapshot.id,
                          blink: false,
                          timer: null,
                          ...docSnapshot.data()
                        })
                        this.stamps.sort((a, b) => a.order - b.order)
                      }, (error) => {
                        console.log('Error getting collection:', error)
                      }))
                  })
              })
            }, (error) => {
              console.log('Error getting collection:', error)
            })
        }, (error) => {
          console.log('Error getting document:', error)
        })
  },
  beforeDestroy () {
    // 各リスナのデタッチ
    Object.values(this.unsubscribe)
      .filter((e) => e != null)
      .forEach((unsubscribe) => {
        if (Array.isArray(unsubscribe)) {
          unsubscribe.forEach((u) => u())
        } else {
          unsubscribe()
        }
      })
  }
}
</script>

<style scoped>
.blinking{
    animation:blink 0.2s ease-in-out infinite alternate;
}

.grayscale100 {
  filter: grayscale(100);
}

.max-w300 {
  max-width: 300px;
}

.max-h300 {
  max-height: 300px;
}

@keyframes blink{
    0% {opacity:0;}
    100% {opacity:1;}
}
</style>
