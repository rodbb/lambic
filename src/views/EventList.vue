<template>
  <v-card>
    <v-card color="light-green">
      <v-card-title>
        <h1 class="headline white--text">イベント一覧</h1>
      </v-card-title>
    </v-card>

    <v-list three-line class="mx-1">
      <template v-for="event in events">

        <router-link to="events" :key="event.id" tag="div">
          <v-list-title :key="event.id">
            <v-list-tile-content :key="event.id" class="mx-3 my-2">
              <div class="my-1">
                {{ event.date.seconds | dateTime }}
                <v-chip v-if="isFinished(event.date.seconds)" small light>終了しました</v-chip>
                <v-chip v-else-if="isToday(event.date.seconds)" small color="green" text-color="white">本日開催</v-chip>
              </div>
              <v-list-tile-title class="my-1">
                <h2>{{ event.title }}</h2>
              </v-list-tile-title>
              <v-list-tile-sub-title v-html="event.description" class="my-1"></v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-title>
          <v-divider :key="event.id" class="mx-3"></v-divider>
        </router-link>

      </template>
    </v-list>

  </v-card>
</template>
<script>
export default {
  name: 'events',
  computed: {
    events () {
      return this.$store.getters.events
    }
  },
  methods: {
    isFinished (seconds) {
      var nowDate = new Date()
      var eventDate = new Date(seconds * 1000 /* to milliseconds */)
      return nowDate.getTime() > eventDate.getTime()
    },
    isToday (seconds) {
      var nowDate = new Date()
      var eventDate = new Date(seconds * 1000 /* to milliseconds */)
      return nowDate.getTime() === eventDate.getTime()
    }
  },
  filters: {
    dateTime (seconds) {
      return new Date(seconds * 1000 /* to milliseconds */).toLocaleString()
    }
  }
}
</script>
