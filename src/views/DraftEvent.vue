<template>
  <v-layout v-if="isNewEvent || event"
    row class="pb-5">
    <v-flex>

      <v-card class="mb-2">
        <v-card-title v-if="this.isNewEvent">
          <h1 class="headline">イベント登録</h1>
        </v-card-title>
        <v-card-title v-else>
          <h1 class="headline">イベント編集</h1>
        </v-card-title>

        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-container fluid class="py-1">

            <v-layout row>
              <v-flex xs12 md12>
                <h3>概要</h3>
              </v-flex>
            </v-layout>

            <v-layout row>
              <v-flex xs12 md7>
                <v-text-field
                  v-model="title"
                  label="イベント名"
                  outline
                  :rules="titleRules"
                  required
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout row>
              <v-flex xs12 md7>
                <v-textarea
                  v-model="description"
                  label="イベント説明"
                  outline
                  :counter="descriptionMaxLength"
                  :rules="descriptionRules"
                >
                </v-textarea>
              </v-flex>
            </v-layout>

            <!-- 日時 -->
            <v-layout row>
              <v-flex xs12 md12>
                <h3>日時</h3>
              </v-flex>
            </v-layout>

            <v-layout row>
              <v-flex xs6 md3>
                <v-menu
                  ref="startDateMenu"
                  v-model="startDateMenu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on }">
                    <v-text-field
                      v-model="startDate"
                      label="日付"
                      outline
                      v-on="on"
                      :rules="satrtDateRules"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="startDate" no-title @input="startDateMenu = false"></v-date-picker>
                </v-menu>
              </v-flex>

              <v-flex xs3 md1>
                <v-select
                  v-model="startTimeHour"
                  :items="hours"
                  label="時"
                  outline
                ></v-select>
              </v-flex>

              <v-flex xs3 md1>
                <v-select
                  v-model="startTimeMin"
                  :items="minutes"
                  label="分"
                  outline
                ></v-select>
              </v-flex>
            </v-layout>

            <v-layout row class="py-2">
              <v-flex xs12 md7>
                <v-checkbox
                  v-model="checkConfidential"
                  color="green"
                  required
                >
                  <template v-slot:label>
                    <span class="black--text">
                      上記記載内容に、社外へ公開不可な情報は含まれていません。
                    </span>
                  </template>
                </v-checkbox>
              </v-flex>
            </v-layout>

          </v-container>
        </v-form>
      </v-card>

      <v-btn
        @click="submit"
        :disabled="!checkConfidential"
        color="orange"
        block
        large
        class="my-2 white--text"
      >
        イベントを登録する
      </v-btn>

      <v-btn
        fixed
        fab
        bottom
        left
        color="green"
        @click="backTo"
      >
        <v-icon>arrow_back</v-icon>
      </v-btn>

    </v-flex>
  </v-layout>
  <v-progress-linear v-else :indeterminate="event !== null">
  </v-progress-linear>
</template>
<script>
import moment from 'moment'
const NEW_PRESENTATION_KEYWORD = 'new'
export default {
  name: 'draftEvent',
  props: {
    id: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      isNewEvent: false,
      valid: true,
      title: '', // 入力するイベントタイトル
      titleMaxLength: 50, // イベントタイトル最大文字数
      description: '', // 入力するイベント内容
      descriptionMaxLength: 500, // イベント内容最大文字数
      startDateMenu: false,
      startDate: null, // 開始日
      startTimeHour: '00', // 開始時間(時)
      startTimeMin: '00', // 開始時間(分)
      checkConfidential: false,
      titleRules: [
        // イベントタイトル入力規則
        v => !!v || 'イベント名は必須です。',
        v => v.length <= this.titleMaxLength || 'イベント名は' + this.titleMaxLength + '文字以内にしてください。'
      ],
      descriptionRules: [
        // イベント内容入力規則
        v => v.length <= this.descriptionMaxLength || 'イベント説明文は' + this.descriptionMaxLength + '文字以内にしてください。'
      ],
      satrtDateRules: [
        // イベント開始日入力規則
        v => !!v || 'イベント日時は必須です。'
      ]
    }
  },
  created () {
    this.isNewEvent = this.id === NEW_PRESENTATION_KEYWORD
    const event = this.isNewEvent ? null : this.$store.getters.event(this.id)
    if (event) {
      // 編集の場合、対象のイベントデータをセットする
      this.title = event.title
      this.description = event.description
      this.startDate = moment(event.date).format('YYYY-MM-DD')
      this.startTimeHour = moment(event.date).format('HH')
      this.startTimeMin = moment(event.date).format('mm')
    }
  },
  computed: {
    /*
     * イベントの取得
     */
    event () {
      return this.$store.getters.event(this.id)
    },
    /*
     * ユーザ情報取得
     */
    user () {
      return this.$store.getters.user
    },
    /*
     * 00-23の数字配列を返す
     */
    hours () {
      return [...Array(24).keys()].map(i => ('0' + i).slice(-2))
    },
    /*
     * 00-55間にて5刻みの数字配列を返す
     */
    minutes () {
      return [...Array(12).keys()].map(i => ('0' + (i * 5)).slice(-2))
    }
  },
  methods: {
    /*
     * 入力内容を登録する
     */
    submit () {
      // バリデート
      if (!this.$refs.form.validate() || !this.checkConfidential) {
        return 0
      }
      if (this.isNewEvent && confirm('イベントを追加します。よろしいですか？')) {
        // イベント登録処理
        this.$store.dispatch('appendEvent', {
          title: this.title,
          description: this.description,
          date: new Date(this.startDate + ' ' + this.startTimeHour + ':' + this.startTimeMin)
        })
        this.$router.push({ path: '/events' })
      } else if (!this.isNewEvent && confirm('イベント内容を更新します。よろしいですか？')) {
        // イベント更新処理
        console.log(this.id)
        this.$store.dispatch('updateEvent', {
          eventId: this.id,
          eventInfo: {
            title: this.title,
            description: this.description,
            date: new Date(this.startDate + ' ' + this.startTimeHour + ':' + this.startTimeMin)
          }
        })
        this.$router.push({ path: '/events/' + this.id })
      }
    },
    /*
     * 前のページへ遷移させる
     */
    backTo () {
      if (this.isNewEvent) {
        // 新規作成の場合はイベント一覧画面へ戻る
        this.$router.push({ path: '/events' })
      } else {
        // 編集の場合はイベント詳細画面へ戻る
        this.$router.push({ path: '/events/' + this.id })
      }
    }
  }
}
</script>
