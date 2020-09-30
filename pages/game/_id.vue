<template>
  <div>
    <h1>始まったよ</h1>
    <v-app>
      <div>
        <v-btn color="primary" @click="finish">END</v-btn>
      </div>
      <v-simple-table> </v-simple-table>
    </v-app>
  </div>
</template>

<script>
export default {
  async asyncData({ store, params }) {
    const roomId = params.id

    const unstart = await store.dispatch('room/start', { roomId })

    return {
      // unsubscribe,
      unstart,
    }
  },
  created() {
    this.roomId = this.$route.params.id
  },
  async destroyed() {
    const user = await this.$user()
    // this.roomId = this.$route.params.id

    const userId = user.uid

    await this.$store.dispatch('room/clear', { userId, roomId: this.roomId })
    // this.unsubscribe()
    this.unstart()
  },
  data() {
    return {
      unstart: null,
      roomId: null,
    }
  },
  methods: {
    async finish() {
      const roomId = this.$route.params.id

      await this.$store.dispatch('room/finish', { roomId })
    },
  },
}
</script>
