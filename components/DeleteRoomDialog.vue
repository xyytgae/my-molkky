<template>
  <v-dialog v-model="dialog" max-width="300px">
    <v-card>
      <v-card-title>
        ゲームを終了
      </v-card-title>
      <v-card-text>
        ルームを退出しますか？
      </v-card-text>
      <v-card-actions>
        <v-btn @click="$emit('close-dialog')" color="info" text
          >キャンセル</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn @click="$emit('delete-room')" color="info" text>OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
// import { mapActions } from 'vuex'

export default {
  methods: {
    // ...mapActions('room', ['deleteRoom']),
  },
  data() {
    return {
      dialog: true,
    }
  },
}
</script>
