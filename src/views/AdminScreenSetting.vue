<template>
  <v-layout row class="pb-5">
    <v-flex>

      <v-card class="mb-2 pb-2">

        <v-card-title>
          <div>
            <div v-if="screen" class="grey--text">
              {{ screen.name }}
            </div>
            <h3 class="headline mb-0">スクリーンの管理</h3>
          </div>
        </v-card-title>

        <v-container grid-list-md class="py-0">
          <v-layout row wrap>
            <v-flex xs12 sm8>
              <v-select
              :items="events"
              name="event"
              item-text="title"
              item-value="id"
              box
              label="イベントを選択してください"
              @change="setEventsPresentations"
              >
            </v-select>
            </v-flex>
          </v-layout>

          <v-layout row wrap>
            <v-flex xs12 sm9 xl11>

              <v-card-title class="px-0 py-0" >
                <div>
                  <strong>表示中の発表：</strong>
                </div>
                <template v-if="screen && screen.displayPresentationRef">
                  <div class="text-truncate">
                    {{ getEventTitle(screen.displayPresentationRef.eventId) }}
                  </div>
                  <div v-if="screen.displayPresentationRef" class="text-truncate">
                    &nbsp;>&nbsp;{{ screen.displayPresentationRef.title }}
                  </div>
                  <div v-if="screen.displayPresentationRef.presenter" class="text-truncate">
                    &nbsp;（{{ screen.displayPresentationRef.presenter.name }}）
                  </div>
                </template>
                <template v-else>
                  <div>
                    なし
                  </div>
                </template>
              </v-card-title>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs12>
              <v-card-actions class="px-0">
                <v-btn small color="grey lighten-1" @click="initializeScreen()">
                  表示を停止する
                </v-btn>
              </v-card-actions>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>

      <v-card v-if="this.selectedEvent">
        <v-list two-line>

          <template v-for="presentation in selectedEvent.presentations">
            <v-list-tile
              v-if="presentation.id"
              @click="selectPresentation(presentation)"
              :key="presentation.id + '_list'"
              class="my-2">
              <v-list-tile-avatar :key="presentation.id + '_avatar'">
                <v-icon v-if="screen.displayPresentationRef && presentation.id == screen.displayPresentationRef.id"
                  x-large
                  color="orange lighten-1">
                  cast_connected
                </v-icon>
                <v-icon v-else
                  x-large
                  color="grey lighten-1">
                  cast
                </v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content class="ml-2">
                <v-list-tile-title class="title" :key="presentation.id + '_title'">
                  {{ presentation.title }}
                </v-list-tile-title>
                <v-list-tile-sub-title v-if="presentation.presenter" :key="presentation.id + '_subtitle'">
                  by {{ presentation.presenter.name }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider :key="presentation.id + '_divider'" class="mx-2 my-2"></v-divider>
          </template>

          <template v-if="selectedEvent.presentations == 0">
            <v-card-text>
              まだ発表はありません。
            </v-card-text>
          </template>

        </v-list>
      </v-card>

    </v-flex>
  </v-layout>
</template>
<script>
export default {
  name: 'adminScreenSetting',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      selectedEvent: null
    }
  },
  computed: {
    /*
     * スクリーン情報取得
     */
    screen () {
      return this.$store.getters.screen(this.id)
    },
    /*
     * イベント情報取得
     */
    events () {
      return this.$store.getters.events
    }
  },
  methods: {
    /*
     * プレゼンを表示するイベントをセットする
     */
    setEventsPresentations (eventId) {
      if (!eventId) {
        this.selectedEvent = {}
      } else {
        this.selectedEvent = this.$store.getters.event(eventId)
      }
    },
    /*
     * スクリーンに表示するプレゼンをセット
     */
    selectPresentation (targetPresentation) {
      const msg = 'スクリーンの表示を「' +
        targetPresentation.title +
        '」の情報に変更します。\n' +
        'よろしいですか？'
      if (confirm(msg)) {
        const targetPresentationRef = this.$store.getters.presentation(targetPresentation.id)
        this.$store.dispatch('updateScreen', {
          id: this.id,
          displayPresentationRef: targetPresentationRef
        })
      }
    },
    /*
     * イベント名を取得
     */
    getEventTitle (eventId) {
      const targetEvent = this.$store.getters.event(eventId)
      if (targetEvent) {
        return targetEvent.title
      } else {
        return ''
      }
    },
    /*
     * スクリーンを初期化する
     */
    initializeScreen () {
      if (confirm('スクリーンの表示をリセットします。よろしいですか？')) {
        this.$store.dispatch('updateScreen', {
          id: this.id,
          displayPresentationRef: null
        })
      }
    }
  }
}
</script>
