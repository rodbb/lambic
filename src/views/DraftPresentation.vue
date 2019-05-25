<template>
  <v-layout v-if="event &&
    (isNewPresentation || presentation) &&
    user &&
    user.id == presentation.presenter.id"
    row class="pb-5">
    <v-flex>

      <v-card class="mb-2">
        <v-card-text class="pb-0">
          <v-layout class="grey--text">
            <span class="text-truncate">{{ event.title }}</span>
            <v-spacer></v-spacer>
            <span>{{ event.date | toDateString }}</span>
          </v-layout>
        </v-card-text>
        <v-card-title>
          <h1 class="headline">発表登録</h1>
        </v-card-title>

        <v-form
          ref="form"
          v-model="valid"
          lazy-validation
        >
          <v-container fluid class="py-1">

            <v-layout row class="py-2">
              <v-flex xs12 md7>
                <v-text-field
                  v-model="title"
                  label="タイトル"
                  outline
                  :rules="titleRules"
                  required
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout row class="py-2">
              <v-flex xs12 md7>
                <v-textarea
                  v-model="description"
                  label="内容"
                  outline
                  :counter="descriptionMaxLength"
                  :rules="descriptionRules"
                >
                </v-textarea>
              </v-flex>
            </v-layout>

            <v-layout row class="py-2">
              <v-flex xs12 md7>
                発表へのコメント投稿を許可する。
                <v-switch
                  v-model="isAllowComment"
                  :label="`${ isAllowComment ? 'はい' : 'いいえ' }`"
                  color="green"
                  hide-details
                  class="pt-0 mt-1"
                >
                </v-switch>
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
                      上記登録内容に、社外へ公開不可な情報は含まれていません。
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
        登録内容を確定する
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
  <v-progress-linear v-else :indeterminate="event !== null && presentation !== null">
  </v-progress-linear>
</template>
<script>
import moment from 'moment'
const NEW_PRESENTATION_KEYWORD = 'new'
export default {
  name: 'draftPresentation',
  props: {
    eventId: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      isNewPresentation: false,
      valid: true,
      title: '', // 入力する発表タイトル
      titleMaxLength: 50, // 発表タイトル最大文字数
      description: '', // 入力する発表内容
      descriptionMaxLength: 500, // 発表内容最大文字数
      isAllowComment: true, // コメント投稿を許可するかどうか
      checkConfidential: false, // 社外秘チェック
      titleRules: [
        // 発表タイトル入力規則
        v => !!v || 'タイトルは必須です。',
        v => v.length <= this.titleMaxLength || 'タイトルは50文字以内にしてください。'
      ],
      descriptionRules: [
        // 発表内容入力規則
        v => v.length <= this.descriptionMaxLength || '内容は500文字以内にしてください。'
      ]
    }
  },
  created () {
    this.isNewPresentation = this.id === NEW_PRESENTATION_KEYWORD
    const presentation = this.isNewPresentation ? null : this.$store.getters.presentation(this.id)
    if (presentation) {
      // 編集の場合、対象の発表データをセットする
      this.title = presentation.title
      this.description = presentation.description
      this.isAllowComment = presentation.isAllowComment
    }
  },
  computed: {
    /*
     * イベントの取得
     */
    event () {
      return this.$store.getters.event(this.eventId)
    },
    /*
     * プレゼンテーションの取得
     */
    presentation () {
      if (!this.isNewPresentation) {
        // 新規作成でない場合
        return this.$store.getters.presentation(this.id)
      }
      return null
    },
    /*
     * ユーザ情報取得
     */
    user () {
      return this.$store.getters.user
    }
  },
  filters: {
    /*
     * 日付のフォーマット
     */
    toDateString (date) {
      return moment(date).format('YYYY/MM/DD（ddd）')
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
      if (this.isNewPresentation && confirm('発表を申し込みます。よろしいですか？')) {
        // 発表登録処理
        this.$store.dispatch('addPresentation', {
          eventId: this.eventId,
          title: this.title,
          description: this.description,
          isAllowComment: this.isAllowComment
        })
        this.$router.push({ path: '/events/' + this.eventId })
      } else if (!this.isNewPresentation && confirm('発表内容を更新します。よろしいですか？')) {
        this.$store.dispatch('updatePresentation', {
          presentationId: this.id,
          presentationInfo: {
            eventId: this.eventId,
            title: this.title,
            description: this.description,
            isAllowComment: this.isAllowComment
          }
        })
        this.$router.push({ path: '/presentations/' + this.id })
      }
    },
    /*
     * 前のページへ遷移させる
     */
    backTo () {
      if (this.isNewPresentation) {
        // 新規作成の場合はイベント詳細画面へ戻る
        this.$router.push({ path: '/events/' + this.eventId })
      } else {
        // 編集の場合は発表詳細画面へ戻る
        this.$router.push({ path: '/presentations/' + this.id })
      }
    }
  }
}
</script>
