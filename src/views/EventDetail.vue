<template>

  <v-layout v-if="event" row wrap class="pb-5">
    <v-flex>
      <v-card class="mb-2" color="light-green lighten-4">
        <v-card-title primary-title>
          <div>
            <div class="grey--text mb-3">{{ event.date | toDateString }}</div>
            <div class="headline">{{ event.title }}</div>
          </div>
        </v-card-title>
        <v-card-text>
          {{ event.description }}
        </v-card-text>
      </v-card>

      <v-card v-if="presentations != 0">

        <v-list two-line>
          <template v-for="(presentation, index) in presentations">

            <v-list-tile :key="presentation.id" :to="{ path: '/events/' + id + '/presentations/' + presentation.id }">

              <v-list-tile-content>
                <v-list-tile-title class="title">
                  {{ presentation.title }}
                </v-list-tile-title>
                <v-list-tile-sub-title v-if="presentation.presenter">
                  by {{ presentation.presenter.name }}
                </v-list-tile-sub-title>
                <v-list-tile-sub-title>
                  {{ presentation.description }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-divider v-if="index+1 < presentations.length"
              :key="presentation.id + '_divider'"
              class="mx-2 my-2">
            </v-divider>

          </template>
        </v-list>

      </v-card>

      <v-card v-else :indeterminate="presentations == 0">
        <v-card-text>
          まだ発表はありません。
        </v-card-text>
      </v-card>

      <v-btn
        @click="goAddPlesentation"
        color="green"
        block
        large
        class="my-2 white--text"
      >
        <v-icon color="white">add</v-icon>
        発表を申し込む
      </v-btn>

      <v-dialog
        v-model="dialog"
        width="500"
      >
        <v-card>
          <v-card-text class="text-xs-center">
            <p class="title mt-3">発表登録にはログインが必要です。</p>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              color="light-green"
              :to="{ path: '/login' }"
            >
              ログインする
            </v-btn>
          </v-card-actions>
          <v-card-text class="text-xs-center">
            <p>ログインして発表を申し込みましょう。</p>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-btn
        fixed
        fab
        bottom
        left
        color="green"
        :to="{ path: '/events' }"
      >
        <v-icon>arrow_back</v-icon>
      </v-btn>
    </v-flex>
  </v-layout>
  <v-progress-linear v-else :indeterminate="event == null"></v-progress-linear>
</template>

<script>
import moment from 'moment'
import EventRepository from '@/EventRepository'
import PresentationRepository from '@/PresentationRepository'
import UserRepository from '@/UserRepository'
export default {
  name: 'eventDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      show: false,
      dialog: false,
      event: null,
      presentations: [],
      subscriptions: []
    }
  },
  created () {
    // イベントのリスナを作成
    this.subscriptions.push(EventRepository.get(this.id).subscribe((event) => { this.event = event }))

    // イベントに紐づく全発表のリスナを作成
    this.subscriptions.push(PresentationRepository.getAll(this.id)
      .subscribe((presentations) => {
        presentations.forEach((p) => {
          // 発表者
          this.subscriptions.push(UserRepository.get(p.presenter.id).subscribe((user) => { p.presenter = user }))
        })
        this.presentations = presentations
      }))
  },
  filters: {
    toDateString (date) {
      return moment(date).format('YYYY/MM/DD（ddd）')
    }
  },
  methods: {
    /*
     * 発表追加ボタンを押したときの挙動
     */
    goAddPlesentation () {
      if (this.$store.getters.user) {
        // ログインしている場合は発表追加画面へ
        this.$router.push({ path: '/events/' + this.id + '/draftPresentations/' + 'new' })
      } else {
        // 未ログインの場合はログインを促すダイアログを表示
        this.dialog = true
      }
    }
  },
  beforeDestroy () {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
</script>
