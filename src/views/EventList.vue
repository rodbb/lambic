<template>
  <v-layout row class="pb-5">
    <v-flex v-if="events.length != 0">
      <v-card>

        <v-card color="light-green">
          <v-card-title>
            <h1 class="headline white--text">イベント一覧</h1>
          </v-card-title>
        </v-card>

        <v-card>
          <v-list two-line>
            <template v-for="event in events">

                <v-list-tile :key="event.title" :to="{ path: 'events/' + event.id }" class="my-2">
                  <v-list-tile-content>
                    <div>
                      {{ event.date | dateFormat }}
                      <v-chip v-if="event.isFinished" small light>終了しました</v-chip>
                      <v-chip v-else-if="event.isToday" small color="green" text-color="white">本日開催</v-chip>
                    </div>
                    <v-list-tile-title class="title">
                      {{ event.title }}
                    </v-list-tile-title>
                    <v-list-tile-sub-title>
                      {{ event.description }}
                    </v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-divider :key="event.id" class="mx-2"></v-divider>

            </template>
          </v-list>
        </v-card>

      </v-card>
    </v-flex>
    <v-progress-linear v-else :indeterminate="events.length == 0"></v-progress-linear>
  </v-layout>
</template>
<script>
import moment from 'moment'
export default {
  name: 'events',
  computed: {
    events () {
      var nowDate = new Date()
      return this.$store.getters.events
        .map((pr) => {
          var eventDate = new Date(pr.date.seconds * 1000 /* to milliseconds */)
          return {
            ...pr,
            date: eventDate,
            isFinished: moment(eventDate).isBefore(nowDate, 'day'),
            isToday: moment(eventDate).isSame(nowDate, 'day')
          }
        })
    }
  },
  filters: {
    dateFormat (date) {
      return moment(date).format('YYYY/MM/DD（ddd）')
    }
  }
}
</script>
