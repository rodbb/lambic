<template>
  <v-layout row class="pb-5">
    <v-flex>

      <v-card>
        <v-card-text>
          <v-layout align-center mb-3 class="grey--text">
            <span>{{ event.title }}</span>
            <v-spacer></v-spacer>
            <span>{{ event.date.seconds | dateTime }}</span>
          </v-layout>
          <h1 class="headline">{{ presentation.title }}</h1>
          <div class="grey--text mb-3">{{ presentation.presenter.name }}</div>
          <p>{{ presentation.description }}</p>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>
          <h1 class="headline">コメント一覧</h1>
        </v-card-title>
        <template v-for="comment in presentation.comments">
          <v-divider :key="comment.id + '-divider'"></v-divider>
          <v-card-text :key="comment.id">
            <v-layout align-center mb-3>
              <v-avatar color="grey" size="24" class="mr-3"></v-avatar>
              <strong class="title">{{ comment.userRef.name }}</strong>
              <v-spacer></v-spacer>
              <span>{{ comment.postedAt.seconds | dateTime }}
              </span>
            </v-layout>
            <p>{{ comment.comment }}</p>
          </v-card-text>
        </template>
        <v-card-text v-if="presentation.comments.length === 0">
          <p>まだコメントはありません。</p>
        </v-card-text>
      </v-card>

      <v-btn
        fixed
        fab
        bottom
        left
        color="green"
      >
        <v-icon>arrow_back</v-icon>
      </v-btn>

      <v-dialog
        v-model="dialog"
        width="500"
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
      comment: ''
    }
  },
  computed: {
    presentation () {
      return this.$store.getters.presentation(this.id)
    },
    event () {
      return this.$store.getters.event(this.presentation.eventId)
    }
  },
  filters: {
    dateTime (seconds) {
      return new Date(seconds * 1000).toLocaleString()
    }
  },
  methods: {
    postCommnet () {
      this.$store.dispatch('appendComment', { comment: this.comment, presentationId: this.id })
      this.closeComment()
    },
    closeComment () {
      this.comment = ''
      this.dialog = false
    }
  }
}
</script>
