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

      <v-card>
        <v-list two-line>
          <template v-for="presentation in event.presentations">
            <v-list-tile v-if="presentation.id" :key="'list-' + presentation.id" class="my-2">

              <v-list-item-avatar :key="'avatar-' + presentation.id">
                <v-icon x-large color="grey lighten-1">cast</v-icon>
              </v-list-item-avatar>

              <v-list-tile-title class="title ml-2" :key="'title-' + presentation.id">
                {{ presentation.title }}
              </v-list-tile-title>

              <v-list-tile-sub-title v-if="presentation.presenter" :key="'sub-title-' + presentation.id">
                by {{ presentation.presenter.name }}
              </v-list-tile-sub-title>

              <v-divider :key="'divider-' + presentation.id" class="mx-2"></v-divider>
            </v-list-tile>
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
      event: {}
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
