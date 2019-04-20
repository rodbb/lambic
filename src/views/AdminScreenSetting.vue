<template>
  <v-layout row class="pb-5">
    <v-flex>

      <v-card class="mb-2">
        <v-card-title>
          <h1 class="headline">スクリーン管理</h1>
        </v-card-title>
        <v-container grid-list-md class="py-0">
          <v-layout row wrap>

            <v-flex xs12 sm8>
              <v-select
              :items="events"
              name="event"
              item-text="title"
              item-value="id"
              box
              label="イベントを選択してください"
              @change="setEventsPresentations"
              >
            </v-select>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>

      <v-card v-if="this.event">
        <v-list two-line>
          <template v-for="presentation in event.presentations">
            <v-list-tile v-if="presentation.id" :key="presentation.id + '_list'" class="my-2">

              <v-list-item-avatar :key="presentation.id + '_avatar'">
                <v-icon x-large color="grey lighten-1">cast</v-icon>
              </v-list-item-avatar>

              <v-list-tile-title class="title ml-2" :key="presentation.id + '_title'">
                {{ presentation.title }}
              </v-list-tile-title>

              <v-list-tile-sub-title v-if="presentation.presenter" :key="presentation.id + '_subtitle'">
                by {{ presentation.presenter.name }}
              </v-list-tile-sub-title>

            </v-list-tile>

            <v-divider :key="presentation.id + '_divider'" class="mx-2 my-2"></v-divider>

          </template>
          <template v-if="event.presentations == 0">
            <v-card-text>
              まだ発表はありません。
            </v-card-text>
          </template>
        </v-list>
      </v-card>

    </v-flex>
  </v-layout>
</template>
<script>
export default {
  name: 'adminScreenSetting',
  data () {
    return {
      selectedEventId: null,
      event: null
    }
  },
  computed: {
    events () {
      return this.$store.getters.events
    },
    selectedEvent () {
      return this.event
    }
  },
  methods: {
    setEventsPresentations (eventId) {
      if (!eventId) {
        this.event = {}
      } else {
        this.event = this.$store.getters.event(eventId)
        console.log(this.event)
      }
    }
  }
}
</script>
