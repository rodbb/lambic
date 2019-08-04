<template>
  <v-layout row class="pb-5">
    <v-flex>
      <v-card>
        <v-card-title>
          <div>
            <h3 class="headline mb-0">スタンプ管理</h3>
          </div>
        </v-card-title>
      </v-card>

      <v-card v-if="stamps">
        <v-list two-line>
          <template v-for="(stamp, index) in stamps">
            <v-list-tile
              avatar
              :to="{ path: 'stamps/' + stamp.id }"
              :key="stamp.id + '_list'">
                <v-list-tile-avatar>
                  <v-img
                    :src="stamp.src"
                  ></v-img>
                </v-list-tile-avatar>

                <v-list-tile-content>
                  <v-list-tile-title>altテキスト： {{ stamp.string }}</v-list-tile-title>
                  <v-list-tile-sub-title>使用可能： {{ stamp.canUse }}</v-list-tile-sub-title>
                </v-list-tile-content>
            </v-list-tile>
            <v-divider
              v-if="index+1 < stamps.length"
              :key="stamp.id + '_divider'"
              class="mx-2 my-2">
            </v-divider>
          </template>
        </v-list>
      </v-card>

      <v-card v-else>
        <v-card-title>
          <div>
            スタンプが登録されていません。
          </div>
        </v-card-title>
      </v-card>

      <v-btn
        @click="goAddStamp"
        color="green"
        block
        large
        class="my-2 white--text"
      >
        <v-icon color="white">add</v-icon>
        スタンプを追加する
      </v-btn>

      <v-btn
        fixed
        fab
        bottom
        left
        color="green"
        :to="{ path: '/admin' }"
      >
        <v-icon>arrow_back</v-icon>
      </v-btn>

    </v-flex>
  </v-layout>
</template>
<script>
export default {
  name: 'adminStampList',
  computed: {
    stamps () {
      return this.$store.getters.stamps
    }
  },
  methods: {
    goAddStamp () {
      this.$router.push({ path: '/admin/stamps/' + 'new' })
    }
  }
}
</script>
