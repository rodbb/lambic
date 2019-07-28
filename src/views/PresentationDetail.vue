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

      <v-card  class="py-3 mb-2 sticky-top top-56">
        <template v-for="(stamp, index) in presentation.stamps">
          <v-chip
            v-if="getStampCount(stamp.id) || getStampCount(stamp.id) === 0"
            :key="index"
            @click="countUpStamp(stamp.id)"
            color="light-green"
            text-color="white"
            class="text-xs-center"
            label
          >
            <v-avatar v-if="stamp.src" tile color="grey lighten-3">
              <img :src="stamp.src">
            </v-avatar>
            <v-avatar v-else color="grey lighten-3" class="black--text">
              {{ stamp.string }}
            </v-avatar>
            <span>
              {{ getStampCount(stamp.id) }}
            </span>
          </v-chip>
        </template>
      </v-card>

      <v-card v-if="presentation.isAllowComment !== false">
        <v-card-title>
          <h3>コメント一覧</h3>
        </v-card-title>
        <template v-for="comment in comments">
          <div v-if="comment.isShowtable" v-bind:class="comment.colorClass" :key="comment.id + '-div'">
            <v-divider :key="comment.id + '-divider'"></v-divider>
            <v-card-text :key="comment.id">
              <v-layout v-if="comment.isDirect" mb-0>
                <small class="grey--text">ダイレクトコメント</small>
              </v-layout>
              <v-layout align-center mb-3>
                <v-avatar
                  v-if="comment.userRef.photoURL"
                  size="28"
                  class="mr-1"
                >
                  <img v-bind:src="comment.userRef.photoURL">
                </v-avatar>
                <v-avatar v-else size="28" class="mr-1">
                  <v-icon size="28" color="gray">account_circle</v-icon>
                </v-avatar>
                <strong  class="text-truncate">
                  {{ comment.userRef.name || '（削除されたユーザ）' }}
                </strong>
                <v-spacer></v-spacer>
                <span>{{ comment.postedAt | toDateTimeString }}</span>
                <v-menu bottom left v-if="comment.isEditable || comment.isDeletable">
                  <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on">
                      <v-icon>more_vert</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-tile v-if="comment.isEditable" @click="openModifyComment(comment.id)">
                      <v-list-tile-title>編集</v-list-tile-title>
                    </v-list-tile>
                    <v-list-tile v-if="comment.isDeletable" @click="deleteComment(comment.id)">
                      <v-list-tile-title>削除</v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </v-layout>
              <p class="pre">{{ comment.comment }}</p>
            </v-card-text>
          </div>
        </template>
        <v-card-text v-if="comments.length === 0">
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
              v-if="dialog"
              outline
              autofocus
              no-resize
              name="comment-input"
              label="input comment"
              v-model="comment"
            ></v-textarea>

            <v-container grid-list-md class="px-0 py-0">
              <v-layout wrap row>
                <v-flex shrink>
                  <v-checkbox
                    v-model="isDirect"
                    color="primary"
                    class="my-0 py-0"
                  >
                    <template v-slot:label>
                      <span class="black--text">
                        ダイレクトコメントにする
                      </span>
                    </template>
                  </v-checkbox>
                </v-flex>
                <v-flex>
                  <v-tooltip right>
                    <template v-slot:activator="{ on }">
                      <v-icon color="primary" v-on="on">help</v-icon>
                    </template>
                    <span><strong>ダイレクトコメント</strong>：<br>発表者と投稿者のみが<br>閲覧できるコメント</span>
                  </v-tooltip>
                </v-flex>
              </v-layout>
            </v-container>

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
      isDirect: false,
      editingCommentId: null,
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
    /**
     * 情報を補完したコメントリスト
     * userRef：削除されたユーザーの場合でもオブジェクトで参照できるようにデフォルト値を設定
     * isEditable：ログインユーザーがそのコメントを編集できるかどうか（投稿者のみが編集可能）
     * isDeletable：ログインユーザーがそのコメントを削除できるかどうか（管理者または投稿者が削除可能）
     */
    comments () {
      return this.presentation.comments
        .map((cm) => {
          const userRef = cm.userRef || {
            photoURL: null,
            name: null
          }
          const loginUser = this.user || {
            id: null,
            isAdmin: false
          }
          const presentations = this.$store.getters.presentation(this.id)
          const colorClass = cm.isDirect ? 'yellow lighten-4' : ''
          return {
            ...cm,
            userRef,
            isEditable: userRef.id === loginUser.id,
            isDeletable: loginUser.isAdmin || userRef.id === loginUser.id,
            isShowtable: !cm.isDirect || (userRef.id === loginUser.id || presentations.presenter.id === loginUser.id),
            colorClass
          }
        })
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
    /**
     * 指定したコメントの編集モーダルを開く
     * @param {string} commentId
     */
    openModifyComment (commentId) {
      const target = this.comments.find((c) => c.id === commentId)
      if (target == null || !target.isEditable) {
        return alert('そのコメントは編集できません！')
      }
      this.editingCommentId = commentId
      this.comment = target.comment
      this.dialog = true
    },
    validateComment (c) {
      return {
        length: c.length <= 1000,
        required: c.replace(/\s+$/mg, '').length > 0
      }
    },
    /**
     * コメントを保存する
     */
    postCommnet () {
      // eslint-disable-next-line no-irregular-whitespace
      const rtrimRegex = /[ \t\f　]+$/mg
      const com = this.comment.replace(rtrimRegex, '')
      const res = this.validateComment(com)
      if (Object.values(res).every((v) => v)) {
        if (this.editingCommentId == null) {
          this.$store.dispatch('appendComment', {
            comment: com,
            presentationId: this.id,
            isDirect: this.isDirect
          })
        } else {
          const target = this.comments.find((c) => c.id === this.editingCommentId)
          if (target == null || !target.isEditable) {
            return
          }
          this.$store.dispatch('updateComment', {
            comment: com,
            isDirect: this.isDirect,
            commentId: this.editingCommentId
          })
        }
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
      this.editingCommentId = null
      this.errors = []
      this.dialog = false
    },
    /**
     * 指定したコメントの削除
     * @param {string} commentId
     */
    deleteComment (commentId) {
      const target = this.comments.find((c) => c.id === commentId)
      if (target == null || !target.isDeletable) {
        return alert('そのコメントは削除できません！')
      }
      if (confirm('このコメントを削除します。よろしいですか？')) {
        this.$store.dispatch('deleteComment', { commentId })
      }
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

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 1;
}

.top-56 {
  top: 56px;
}
</style>
