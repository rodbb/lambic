<template>

  <v-layout row wrap>
    <v-flex>
      <v-card class="mb-2" color="light-green lighten-4">
        <v-card-title primary-title>
          <div>
            <div class="grey--text mb-3">{{ event.date.seconds | dateTime }}</div>
            <div class="headline">{{ event.title }}</div>
          </div>
        </v-card-title>
        <v-card-text>
          {{ event.description }}
        </v-card-text>
      </v-card>

      <v-card>

        <v-list two-line>
          <template v-for="presentation in event.presentations">

            <v-list-tile :key="presentation.id" :to="{ path: '/presentations/' + presentation.id }">

              <v-list-tile-content>
                <v-list-tile-title class="title" v-text="presentation.title">
                </v-list-tile-title>
                <v-list-tile-sub-title v-text="'by ' + presentation.presenter.name">
                </v-list-tile-sub-title>
                <v-list-tile-sub-title v-text="presentation.description">
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-divider :key="presentation.id" class="mx-2 py-2"></v-divider>

          </template>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import moment from 'moment'
export default {
  name: 'eventDetail',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      show: false
    }
  },
  computed: {
    event () {
      return this.$store.getters.event(this.id)
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
