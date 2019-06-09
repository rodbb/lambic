<template>
  <v-list dense class="pt-0">
    <v-list-tile>
      <strong>管理者メニュー</strong>
    </v-list-tile>

    <v-list-tile :to="{name: 'adminScreenList' }">
      <v-list-tile-action>
        <v-icon>cast</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>スクリーンの設定</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-list-tile :to="{name: 'adminStampList' }">
      <v-list-tile-action>
        <v-icon>insert_emoticon</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>スタンプの管理</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
  </v-list>
</template>

<script>
export default {
  name: 'adminPage'
}
</script>
