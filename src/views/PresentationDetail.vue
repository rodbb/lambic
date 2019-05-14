<template>
  <v-layout row class="pb-5">
    <v-flex v-if="presentation != null">

      <v-card>
        <v-card-text>
          <v-layout align-center mb-3 class="grey--text">
            <span>{{ event.title }}</span>
            <v-spacer></v-spacer>
            <span>{{ event.date.seconds | dateTime }}</span>
          </v-layout>
          <h1 class="headline">{{ presentation.title }}</h1>
          <div  v-if="presentation.presenter" class="grey--text mb-3">
            {{ presentation.presenter.name }}
          </div>
          <div  v-else class="grey--text mb-3">
            （発表者情報は削除されています）
          </div>
          <p class="pre">{{ presentation.description }}</p>
        </v-card-text>
      </v-card>

      <v-card  class="pb-3">
        <template v-for="(stamp, index) in presentation.stamps">
          <v-badge bottom overlap v-if="stamp.canUse !== false" :key="index">
            <template v-slot:badge>
              <span>{{ getStampCount(stamp.id) }}</span>
            </template>
            <v-card-actions :key="index">
              <v-btn
                icon
                :key="index"
                @click="countUpStamp(stamp.id)"
              >
              {{ stamp.string }}
              </v-btn>
            </v-card-actions>
          </v-badge>
          <v-badge bottom overlap v-else color="grey" :key="index">
            <template v-slot:badge>
              <span>{{ getStampCount(stamp.id) }}</span>
            </template>
            <v-card-actions :key="index">
              <v-btn
                icon
                disabled
                :key="index"
              >
              {{ stamp.string }}
              </v-btn>
            </v-card-actions>
          </v-badge>
        </template>
      </v-card>

      <v-card v-if="presentation.isAllowComment !== false">
        <v-card-title>
          <h1 class="headline">コメント一覧</h1>
        </v-card-title>
        <template v-for="comment in presentation.comments">
          <v-divider :key="comment.id + '-divider'"></v-divider>
          <v-card-text :key="comment.id">
            <v-layout align-center mb-3>
              <v-avatar color="grey" size="24" class="mr-3"></v-avatar>
              <strong v-if="comment.userRef" class="title">
                {{ comment.userRef.name }}
              </strong>
              <strong v-else class="title">
                （削除されたユーザ）
              </strong>
              <v-spacer></v-spacer>
              <span>{{ comment.postedAt.seconds | dateTime }}
              </span>
            </v-layout>
            <p class="pre">{{ comment.comment }}</p>
          </v-card-text>
        </template>
        <v-card-text v-if="presentation.comments.length === 0">
          <p>まだコメントはありません。</p>
        </v-card-text>
      </v-card>
      <v-card v-else>
        <v-card-title>
          <div class="grey--text">この発表にはコメントできません。</div>
        </v-card-title>
      </v-card>

      <v-btn
        fixed
        fab
        bottom
        left
        color="green"
        :to="prevLink"
      >
        <v-icon>arrow_back</v-icon>
      </v-btn>

      <v-dialog
        v-model="dialog"
        width="500"
        v-if="presentation.isAllowComment !== false"
      >
        <v-btn
          slot="activator"
          fixed
          fab
          bottom
          right
          color="green"
        >
          <v-icon>create</v-icon>
        </v-btn>

        <v-card>
          <v-card-text>
            <v-alert
              outline
              :value="errors.length > 0"
              color="error"
            >
              <ul>
                <li v-for="(err, i) in errors" :key="i">{{ err }}</li>
              </ul>
            </v-alert>
            <v-textarea
              outline
              autofocus
              no-resize
              name="comment-input"
              label="input comment"
              v-model="comment"
            ></v-textarea>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="postCommnet"
            >
              submit
            </v-btn>
            <v-btn
              color="primary"
              flat
              @click="closeComment"
            >
              cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-flex>
    <v-progress-linear v-else :indeterminate="presentation == null"></v-progress-linear>
  </v-layout>
</template>

<script>
export default {
  name: 'presentation',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      dialog: false,
      comment: '',
      errors: []
    }
  },
  created () {
    this.$store.dispatch('watchStampCount', { presentationId: this.id })
  },
  computed: {
    presentation () {
      return this.$store.getters.presentation(this.id)
    },
    event () {
      return this.$store.getters.event(this.presentation.eventId)
    },
    prevLink () {
      return {
        name: 'eventDetail',
        params: {
          id: this.presentation.eventId
        }
      }
    }
  },
  filters: {
    dateTime (seconds) {
      return new Date(seconds * 1000 /* to milliseconds */).toLocaleString()
    }
  },
  methods: {
    validateComment (c) {
      return {
        length: c.length <= 1000,
        required: c.replace(/\s+$/mg, '').length > 0
      }
    },
    postCommnet () {
      // eslint-disable-next-line no-irregular-whitespace
      const rtrimRegex = /[ \t\f　]+$/mg
      const com = this.comment.replace(rtrimRegex, '')
      const res = this.validateComment(com)
      if (Object.values(res).every((v) => v)) {
        this.$store.dispatch('appendComment', { comment: com, presentationId: this.id })
        this.closeComment()
      } else {
        this.errors = [
          !res.length ? 'コメントは1000文字までです' : null,
          !res.required ? 'コメントを入力してください' : null
        ]
          .filter((e) => e != null)
      }
    },
    closeComment () {
      this.comment = ''
      this.errors = []
      this.dialog = false
    },
    /**
     * スタンプのカウントを取得
     * @param stampId
     * @returns {number}
     */
    getStampCount (stampId) {
      const countObj = this.$store.getters.count(stampId)
      return countObj ? countObj.count : 0
    },
    /**
     * スタンプのカウントをインクリメント
     * @param stampId
     */
    countUpStamp (stampId) {
      this.$store.dispatch('countUpStamp', { presentationId: this.id, stampId: stampId })
    }
  }
}
</script>

<style scoped>
.pre {
  white-space: pre-wrap;
}
</style>
