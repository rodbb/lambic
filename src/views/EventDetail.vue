<template>

  <v-layout row>
    <v-flex>
      <v-card class="mb-2" color="light-green lighten-5">
        <v-card-title primary-title>
          <div>
            <div class="grey--text mb-2">{{ event.date }}</div>
            <div class="headline">{{ event.title }}</div>
          </div>
        </v-card-title>

        <v-card-actions>
          <v-btn icon @click="show = !show">
            <v-icon>share</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn icon @click="show = !show">
            <v-icon>{{ show ? 'keyboard_arrow_down' : 'keyboard_arrow_up' }}</v-icon>
          </v-btn>
       </v-card-actions>

        <v-slide-y-transition>
          <v-card-text v-show="show">
            {{ event.description }}
          </v-card-text>
        </v-slide-y-transition>

      </v-card>

      <v-card>

        <v-list two-line>
          <template v-for="(item, index) in presentations">

            <v-divider :key="index"></v-divider>

            <v-list-tile :key="item.title">

              <v-list-tile-content>
                <v-list-tile-title v-html="item.title"></v-list-tile-title>
                <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </template>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
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
    },
    presentations () {
      return this.$store.getters.presentations
    }
  }
}
</script>
