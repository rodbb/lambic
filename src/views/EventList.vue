<template>
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
                  {{ event.date.seconds | dateTime }}
                  <v-chip v-if="isFinished(event.date.seconds)" small light>終了しました</v-chip>
                  <v-chip v-else-if="isToday(event.date.seconds)" small color="green" text-color="white">本日開催</v-chip>
                </div>
                <v-list-tile-title v-text="event.title" class="title"></v-list-tile-title>
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
</template>
<script>
import moment from 'moment'
export default {
  name: 'events',
  computed: {
    events () {
      // 日付順にソート
      const events = this.$store.getters.events
      events.sort((a, b) => {
        a = a['date']
        b = b['date']
        return a === b ? 0 : a > b ? -1 : 1
      })
      return events
    }
  },
  methods: {
    isFinished (seconds) {
      var nowDate = new Date()
      var eventDate = new Date(seconds * 1000 /* to milliseconds */)
      return moment(eventDate).isBefore(nowDate, 'day')
    },
    isToday (seconds) {
      var nowDate = new Date()
      var eventDate = new Date(seconds * 1000 /* to milliseconds */)
      return moment(eventDate).isSame(nowDate, 'day')
    }
  },
  filters: {
    dateTime (seconds) {
      var date = new Date(seconds * 1000 /* to milliseconds */)
      return moment(date).format('YYYY/MM/DD（ddd）')
    }
  }
}
</script>
