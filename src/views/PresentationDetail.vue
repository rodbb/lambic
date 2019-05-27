<template>
  <v-layout row class="pb-5">
    <v-flex v-if="presentation != null">

      <v-card>
        <v-card-text>
          <v-layout align-center mb-2 class="grey--text">
            <span class="text-truncate">{{ event.title }}</span>
            <v-spacer></v-spacer>
            <span>{{ event.date | toDateString }}</span>
          </v-layout>
          <v-layout align-center>
          <h1 class="headline">{{ presentation.title }}</h1>
          <v-spacer></v-spacer>

          <v-menu
            v-if="user != null &&
              presentation.presenter &&
              presentation.presenter.id == user.id"
            bottom
            left
          >
            <template v-slot:activator="{ on }">
              <v-btn icon v-on="on" class="mx-0 my-0">
                <v-icon color="gray">more_vert</v-icon>
              </v-btn>
            </template>
            <v-list class="px-2">
              <v-list-tile @click="editPresentation">
                <v-list-tile-title>
                  <v-icon class="mr-1">edit</v-icon>編集する
                </v-list-tile-title>
              </v-list-tile>
              <v-divider class="mx-2"></v-divider>
              <v-list-tile @click="deletePresentation">
                <v-list-tile-title>
                  <v-icon class="mr-1">delete_forever</v-icon>削除する
                </v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>

          </v-layout>

          <div  v-if="presentation.presenter" class="grey--text mb-3">
            by {{ presentation.presenter.name }}
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
                v-if="stamp.src"
                icon
                @click="countUpStamp(stamp.id)"
              >
                <img
                  class="stamp"
                  :src="stamp.src"
                >
              </v-btn>
              <v-btn
                v-else
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
                v-if="stamp.src"
                icon
                disabled
               >
                <img
                  class="stamp"
                  :src="stamp.src"
                >
              </v-btn>
              <v-btn
                v-else
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
          <h3>コメント一覧</h3>
        </v-card-title>
        <template v-for="comment in presentation.comments">
          <v-divider :key="comment.id + '-divider'"></v-divider>
          <v-card-text :key="comment.id">
            <v-layout align-center mb-3>
              <v-avatar
                v-if="comment.userRef !== null && comment.userRef.photoURL"
                size="28"
                class="mr-1"
              >
                <img v-bind:src="comment.userRef.photoURL">
              </v-avatar>
              <v-avatar v-else size="28" class="mr-1">
                <v-icon size="28" color="gray">account_circle</v-icon>
              </v-avatar>
              <strong v-if="comment.userRef">
                {{ comment.userRef.name }}
              </strong>
              <strong v-else class="text-truncate">
                （削除されたユーザ）
              </strong>
              <v-spacer></v-spacer>
              <span>{{ comment.postedAt | toDateTimeString }}
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

        <v-card v-if="user">
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
        <v-card v-else>
          <v-card-text class="text-xs-center">
            <p class="title mt-3">コメントしてみませんか？</p>
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
            <p>ログインすると発表にコメントできます。</p>
          </v-card-text>
        </v-card>
      </v-dialog>

    </v-flex>
    <v-progress-linear v-else :indeterminate="presentation == null"></v-progress-linear>
  </v-layout>
</template>

<script>
import moment from 'moment'

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
      unsubscribes: [],
      dialog: false,
      comment: '',
      errors: []
    }
  },
  async created () {
    this.unsubscribes = await this.$store.dispatch('watchStampCount', { presentationId: this.id })
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
    },
    user () {
      return this.$store.getters.user
    }
  },
  filters: {
    toDateString (date) {
      return moment(date).format('YYYY/MM/DD（ddd）')
    },
    toDateTimeString (date) {
      return moment(date).format('YYYY/MM/DD HH:mm')
    }
  },
  methods: {
    editPresentation () {
      this.$router.push({
        path: '/' +
        this.presentation.eventId +
        '/draftPresentations/' +
        this.id
      })
    },
    deletePresentation () {
      if (confirm('この発表を削除します。よろしいですか？')) {
        this.$store.dispatch('deletePresentation', this.id)
        this.$router.push({ path: '/events/' + this.presentation.eventId })
      }
    },
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
      return countObj ? countObj.count : ''
    },
    /**
     * スタンプのカウントをインクリメント
     * @param stampId
     */
    countUpStamp (stampId) {
      this.$store.dispatch('countUpStamp', { presentationId: this.id, stampId: stampId })
    }
  },
  beforeDestroy () {
    this.unsubscribes.forEach((u) => u())
    this.$store.dispatch('clearCounts')
  }
}
</script>

<style scoped>
.pre {
  white-space: pre-wrap;
}

.stamp {
  border-radius: 50%;
  max-width: 28px;
  max-height: 28px;
}
</style>
