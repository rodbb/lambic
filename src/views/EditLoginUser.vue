<template>
  <v-layout v-if="user" row wrap class="pb-5">
    <v-flex>
      <v-card>
        <v-card-title primary-title>
          <div class="headline">アカウント情報</div>
        </v-card-title>
        <v-container fluid>
          <v-layout row>
            <v-flex xs12>
              <strong>ユーザ名</strong>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 md6>
              <v-text-field
                v-bind:value="user.name"
                placeholder="ユーザ名を入力してください"
                solo
              ></v-text-field>
            </v-flex>
          </v-layout>
          <v-layout row>
            <v-flex xs12 md6>
              <v-btn color="green">更新する</v-btn>
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
  computed: {
    user () {
      return this.$store.getters.user
    }
  }
}
</script>
