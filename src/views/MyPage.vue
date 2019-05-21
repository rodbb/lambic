<template>
  <v-layout row wrap class="pb-5">
    <v-flex>
      <v-card>
        <v-card-title primary-title>
          <div class="headline">アカウント情報</div>
        </v-card-title>
        <v-alert
          outline
          transition="scale-transition"
          :value="errors.length > 0"
          color="error"
          class="mx-2"
        >
          <ul>
            <li v-for="(err, i) in errors" :key="i">{{ err }}</li>
          </ul>
        </v-alert>
        <v-container fluid>
          <v-layout row>
            <v-flex xs12>
              <strong>ユーザ名</strong>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 md5>
              <v-text-field
                v-model="name"
                placeholder="ユーザ名を入力してください"
                single-line
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 md6>
              <v-btn @click="updateUserInfo" color="green" class="white--text">
                更新する
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
    <v-snackbar
      v-model="snackbar"
      :bottom="'top' === 'bottom'"
      :timeout=5000
      :top="'top'"
      color=green
    >
      更新しました。
      <v-btn flat @click="snackbar = false">
        <v-icon color="white">close</v-icon>
      </v-btn>
    </v-snackbar>
  </v-layout>
</template>

<script>
export default {
  name: 'myPage',
  data () {
    return {
      name: '',
      errors: [],
      snackbar: false
    }
  },
  created () {
    if (this.$store.getters.user) {
      this.name = this.$store.getters.user.name
    }
  },
  methods: {
    validateUserName (name) {
      const maxLength = 50
      return {
        length: name.length <= maxLength,
        required: name.replace(/\s+$/mg, '').length > 0
      }
    },
    updateUserInfo () {
      const res = this.validateUserName(this.name)
      if (Object.values(res).every((v) => v)) {
        this.errors = []
        this.$store.dispatch('updateUserInfo', { name: this.name })
        this.snackbar = true
      } else {
        this.errors = [
          !res.length ? 'ユーザ名は50文字以内にしてください。' : '',
          !res.required ? 'ユーザ名を入力してください。' : ''
        ]
          .filter((e) => e !== '')
      }
    }
  }
}
</script>
