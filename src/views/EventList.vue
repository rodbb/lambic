<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">イベント一覧</h1>
    </v-card-title>
  </v-card>

</template>
<script>
export default {
  name: 'events',
  computed: {
    events () {
      return this.$store.getters.events
    }
  }
}
</script>
