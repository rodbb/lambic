<template>
  <v-app>
    <v-toolbar height="80" extended>
      <v-toolbar-title class="display-3">{{ presentationTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <qriously id="qrcode" class="pt-1 pb-0" :value="qrUrl" :size="140"/>
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
import PresentationRepository from '@/PresentationRepository'
import ScreenRepository from '@/ScreenRepository'
import StampCountRepository from '@/StampCountRepository'
import StampRepository from '@/StampRepository'

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
        stamps: null,
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
    },
    qrUrl () {
      return (this.screenInfo !== null && this.screenInfo.displayPresentationRef !== null)
        ? `${window.location.origin}/#/presentations/${this.screenInfo.displayPresentationRef.id}`
        : window.location.origin
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
    // screenのリスナを設定
    this.unsubscribe.screenInfo = ScreenRepository.get(this.id)
      .subscribe((screen) => {
        // 表示する発表が切り替わった時の初期化処理
        if (this.unsubscribe.presentation != null) {
          this.unsubscribe.presentation.unsubscribe()
          this.presentation = null
        }
        if (this.unsubscribe.stampCounts !== []) {
          this.unsubscribe.stampCounts.forEach((s) => s.unsubscribe())
          this.stampCounts = []
        }
        // 表示する発表が取得できない場合は後続のリスナの設定不要
        this.screenInfo = screen
        if (this.screenInfo.displayPresentationRef == null) {
          this.isLoadong = false
          return
        }
        const presentationId = this.screenInfo.displayPresentationRef.id
        // presentationのリスナを設定
        this.unsubscribe.presentation = PresentationRepository.getWithUser(presentationId)
          .subscribe((presentation) => {
            this.presentation = presentation
            this.isLoadong = false
          })
        // shardsのリスナを設定
        this.unsubscribe.stampCounts = StampCountRepository.getChanges(presentationId)
          .subscribe((stampCounts) => {
            stampCounts.forEach((stampCount) => {
              // サブコレクション`shards`を監視し、変更があれば再計算の上反映する
              let totalCount = 0
              stampCount.shardChanges.forEach((shardChange) => {
                totalCount += shardChange.doc.data().count
              })
              const countObj = {
                stampId: stampCount.stampId,
                count: totalCount
              }
              // cloneした配列に対して変更し、元配列を上書きする
              // 単純に元配列を変更すると、更新前後で同じオブジェクトを参照し、差分が取れないため
              let tmpStampCounts = []
              this.stampCounts.forEach((stampCount) => {
                tmpStampCounts.push(JSON.parse(JSON.stringify(stampCount)))
              })
              const idx = tmpStampCounts.findIndex((c) => c.stampId === stampCount.stampId)
              if (idx !== -1) {
                tmpStampCounts.splice(idx, 1, countObj)
              } else {
                tmpStampCounts.push(countObj)
              }
              this.stampCounts = tmpStampCounts
            })
          })
      })
    // stampsのリスナを設定
    this.unsubscribe.stamps = StampRepository.getAll()
      .subscribe((stamps) => {
        const convertedStamps = []
        stamps.forEach((stamp) => {
          convertedStamps.push({
            id: stamp.id,
            blink: false,
            timer: null,
            ...stamp
          })
        })
        this.stamps = convertedStamps
      })
  },
  beforeDestroy () {
    // 各リスナのデタッチ
    Object.values(this.unsubscribe)
      .filter((e) => e != null)
      .forEach((unsubscribe) => {
        if (Array.isArray(unsubscribe)) {
          unsubscribe.forEach((s) => unsubscribe())
        } else {
          unsubscribe.unsubscribe()
        }
      })
  }
}
</script>

<style scoped>
#qrcode {
    height: 100%;
}
.blinking{
    animation:blink 0.2s ease-in-out infinite alternate;
}
@keyframes blink{
    0% {opacity:0;}
    100% {opacity:1;}
}
</style>
