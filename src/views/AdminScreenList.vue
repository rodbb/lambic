<template>
  <v-layout row class="pb-5">
    <v-flex>
      <v-card>
        <v-card-title>
          <div>
            <h3 class="headline mb-0">スクリーン管理</h3>
          </div>
        </v-card-title>
      </v-card>

      <v-card v-if="screens">
        <v-list>

          <template v-for="(screen, index) in screens">
            <v-list-tile
              :to="{ path: 'screens/' + screen.id }"
              :key="screen.id + '_list'">
              <v-list-tile-title class="title ml-2" :key="screen.id + '_title'">
                <template v-if="screen.name">
                  {{ screen.name }}
                </template>
                <template v-else>
                  （スクリーン名未設定）
                </template>
              </v-list-tile-title>
            </v-list-tile>
            <v-divider
              v-if="index+1 < screens.length"
              :key="screen.id + '_divider'"
              class="mx-2 my-2">
            </v-divider>
          </template>

        </v-list>
      </v-card>

      <v-card v-else>
        <v-card-title>
          <div>
            スクリーンが登録されていません。
          </div>
        </v-card-title>
      </v-card>

    </v-flex>
  </v-layout>
</template>
<script>
export default {
  name: 'adminScreenList',
  computed: {
    screens () {
      return this.$store.getters.screens
    }
  }
}
</script>
