<template>

  <v-layout v-if="event" row wrap class="pb-5">
    <v-flex>
      <v-card class="mb-2" color="light-green lighten-4">
        <v-card-title primary-title>
          <div>
            <div class="grey--text mb-3">{{ event.date | toDateString }}</div>
            <div class="headline">{{ event.title }}</div>
          </div>
        </v-card-title>
        <v-card-text>
          {{ event.description }}
        </v-card-text>
      </v-card>

      <v-card v-if="event.presentations != 0">

        <v-list two-line>
          <template v-for="(presentation, index) in event.presentations">

            <v-list-tile :key="presentation.id" :to="{ path: '/presentations/' + presentation.id }">

              <v-list-tile-content>
                <v-list-tile-title class="title">
                  {{ presentation.title }}
                </v-list-tile-title>
                <v-list-tile-sub-title v-if="presentation.presenter">
                  by {{ presentation.presenter.name }}
                </v-list-tile-sub-title>
                <v-list-tile-sub-title>
                  {{ presentation.description }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-divider v-if="index+1 < event.presentations.length"
              :key="presentation.id + '_divider'"
              class="mx-2 my-2">
            </v-divider>

          </template>
        </v-list>

      </v-card>

      <v-card v-else :indeterminate="event.presentations == 0">
        <v-card-text>
          まだ発表はありません。
        </v-card-text>
      </v-card>

      <v-btn
        :to="{ path: '/' + id + '/draftPresentations/' + 'new' }"
        color="green"
        block
        large
        class="my-3 white--text"
      >
        <v-icon color="white">add</v-icon>
        発表を登録する
      </v-btn>

      <v-btn
        fixed
        fab
        bottom
        left
        color="green"
        :to="{ path: '/events' }"
      >
        <v-icon>arrow_back</v-icon>
      </v-btn>
    </v-flex>
  </v-layout>
  <v-progress-linear v-else :indeterminate="event == null"></v-progress-linear>
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
    toDateString (date) {
      return moment(date).format('YYYY/MM/DD（ddd）')
    }
  }
}
</script>
