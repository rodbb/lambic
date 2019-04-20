<template>
  <v-layout row class="pb-5">
    <v-flex>

      <v-card class="mb-2">

        <v-card-title>
          <div>
            <div v-if="screen" class="grey--text">
              {{ screen.name }}
            </div>
            <h3 class="headline mb-0">スクリーン管理</h3>
          </div>
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
            <v-list-tile
              v-if="presentation.id"
              @click="selectPresentation"
              :key="presentation.id + '_list'"
              class="my-2">
              <v-list-item-avatar :key="presentation.id + '_avatar'">
                <v-icon v-if="presentation.id == screen.displayPresentationId"
                  x-large
                  color="orange lighten-1">
                  cast_connected
                </v-icon>
                <v-icon v-else
                  x-large
                  color="grey lighten-1">
                  cast
                </v-icon>
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
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      selectedEventId: null,
      event: null
    }
  },
  computed: {
    screen () {
      return this.$store.getters.screen(this.id)
    },
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
      }
    },
    selectPresentation () {
      // TODO:表示中の発表をアップデート
    }
  }
}
</script>
