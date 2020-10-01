<template>
  <div>
    <v-list>
      <v-list-item-group>
        <template v-for="(item, index) in items">
          <v-list-item :key="item.title">
            <template v-slot:default="{ active }">
              <v-list-item-content>
                <v-list-item-title v-text="item.title" />

                <v-list-item-subtitle
                  class="text--primary"
                  v-text="item.headline"
                />

                <v-list-item-subtitle v-text="item.subtitle" />
              </v-list-item-content>

              <v-list-item-action>
                <v-list-item-action-text v-text="item.action" />

                <v-icon
                  v-if="!active"
                  color="grey lighten-1"
                >
                  mdi-star-outline
                </v-icon>

                <v-icon
                  v-else
                  color="yellow darken-3"
                >
                  mdi-star
                </v-icon>
              </v-list-item-action>
            </template>
          </v-list-item>

          <v-divider
            v-if="index < items.length - 1"
            :key="index"
          />
        </template>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
export default {
  data () {
    return {
      items: [
        {
          title: 'Ali Connors'
        }
      ]
    }
  }
}
</script>
