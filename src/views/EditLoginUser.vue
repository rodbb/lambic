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
                solo
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 md6>
              <v-btn @click="updateUserInfo" color="green">更新する</v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  name: 'editLoginUser',
  data () {
    return {
      name: '',
      errors: []
    }
  },
  created () {
    if (this.$store.getters.user) {
      this.name = this.$store.getters.user.name
    }
  },
  computed: {
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
        this.$store.dispatch('updateUserInfo', this.name)
      } else {
        this.errors = [
          !res.length ? 'ユーザ名は50文字以内にしてください。' : null,
          !res.required ? 'ユーザ名を入力してください。' : null
        ]
          .filter((e) => e != null)
      }
    }
  }
}
</script>
