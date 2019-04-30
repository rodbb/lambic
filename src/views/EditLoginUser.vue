<template>
  <v-layout v-if="user" row wrap class="pb-5">
    <v-flex>
      <v-card>
        <v-card-title primary-title>
          <div class="headline">アカウント情報</div>
        </v-card-title>
        <v-card-text>
          <strong>ユーザ名</strong>
          <v-text-field
            value=""
            placeholder="ユーザ名を入力してください"
            solo
          ></v-text-field>
        </v-card-text>
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
