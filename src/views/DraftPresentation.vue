<template>
  <v-layout v-if="event" row class="pb-5">
    <v-flex>

      <v-card class="mb-2">
        <v-card-text class="pb-0">
          <v-layout class="grey--text">
            <span>{{ event.title }}</span>
            <v-spacer></v-spacer>
            <span>{{ event.date | toDateString }}</span>
          </v-layout>
        </v-card-text>
        <v-card-title>
          <h1 class="headline">発表登録</h1>
        </v-card-title>

        <v-container fluid class="py-1">

          <v-layout row class="py-2">
            <v-flex xs12 md5>
              <v-text-field
                v-model="title"
                label="タイトル"
                :rules="titleRules"
                required
              ></v-text-field>
            </v-flex>
          </v-layout>

          <v-layout row class="py-2">
            <v-flex xs12 md5>
              <v-textarea
                v-model="description"
                label="内容"
                :counter="500"
                :rules="descriptionRules"
              >
              </v-textarea>
            </v-flex>
          </v-layout>

          <v-layout row class="py-2">
            <v-flex xs12 md5>
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
            <v-flex xs12 md5>
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
      </v-card>

      <v-btn
        :disabled="!checkConfidential"
        color="orange"
        block
        large
        class="my-3 white--text"
      >
        登録内容を確定する
      </v-btn>

      <v-btn
        fixed
        fab
        bottom
        left
        color="green"
        :to="{ path: '/events/' + eventId }"
      >
        <v-icon>arrow_back</v-icon>
      </v-btn>

    </v-flex>
  </v-layout>
</template>
<script>
import moment from 'moment'
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
      valid: false,
      title: '',
      titleMaxLength: 50,
      description: '',
      descriptionMaxLength: 500,
      isAllowComment: true,
      checkConfidential: false,
      titleRules: [
        v => !!v || 'タイトルは必須です。',
        v => v.length <= 50 || 'タイトルは50文字以内にしてください。'
      ],
      descriptionRules: [
        v => v.length <= 500 || '内容は500文字以内にしてください。'
      ]
    }
  },
  computed: {
    event () {
      return this.$store.getters.event(this.eventId)
    }
  },
  filters: {
    toDateString (date) {
      return moment(date).format('YYYY/MM/DD（ddd）')
    }
  },
  methods: {
  }
}
</script>
