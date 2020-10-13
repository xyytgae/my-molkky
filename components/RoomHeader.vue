<template>
  <v-app-bar app color="primary" dark>
    <v-avatar v-if="roomData">
      <img :src="roomData.topImageUrl" />
    </v-avatar>

    <v-toolbar-title v-if="roomData" class="name">
      {{ roomData.name }}
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <slot />
  </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  async created() {
    const roomId = this.$route.params.id
    await this.$store.dispatch('header/getRoom', { roomId })
  },
  computed: {
    ...mapGetters('header', ['roomData']),
  },
}
</script>

<style scoped>
.name {
  padding-left: 20px;
}
</style>
