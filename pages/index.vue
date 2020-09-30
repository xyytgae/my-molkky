<template>
  <v-app>
    <Header />
    <div class="class">
      <h1>Molkky</h1>
      <!-- <v-btn color="primary" @click="changeName"><span>名前変更</span></v-btn> -->
      <v-btn color="primary" @click="start"><span>START</span></v-btn>
    </div>
  </v-app>
</template>

<script>
import Header from '~/components/Header'
export default {
  middleware: ['checkAuth'],
  components: {
    Header,
  },
  methods: {
    async start() {
      const auth = await this.$auth()
      if (!auth) {
        this.$router.push('/login')
      } else {
        this.$router.push('/rooms')
      }
    },
  },
}
</script>

<style scoped>
.class {
  margin: auto auto auto;
  text-align: center;
}
</style>
