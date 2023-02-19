<template>
  <div>
    <v-app>
      <UserHeader />

      <v-main class="main">
        <v-container>
          <v-row v-for="room in getterRooms" :key="room.id" dense>
            <v-col cols="12">
              <v-card>
                <div class="d-flex flex-no-wrap">
                  <img :src="room.topImageUrl" class="room-icon" />
                  <v-card-title class="headline">
                    {{ room.name }}
                    <v-icon v-if="room.password">mdi-lock</v-icon>
                  </v-card-title>

                  <v-spacer></v-spacer>

                  <v-card-actions>
                    <v-btn color="info" @click="moveToRoomPage(room.id)"
                      >入室</v-btn
                    >
                  </v-card-actions>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>

        <v-row justify="center">
          <v-dialog v-model="dialog" max-width="600px">
            <v-card>
              <v-card-title>
                <span class="headline">部屋を立てる</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <div class="image">
                      <v-icon
                        v-if="form.image.value"
                        size="30"
                        class="close"
                        @click="form.image.value = null"
                        >mdi-close-circle</v-icon
                      >
                      <template v-if="form.image.value">
                        <img
                          class="icon"
                          :src="form.image.value"
                          @click="selectImage"
                        />
                      </template>
                      <template v-else>
                        <v-icon size="80" @click="selectImage"
                          >mdi-image</v-icon
                        >
                      </template>
                      <input
                        ref="image"
                        type="file"
                        style="display: none"
                        accept="image/*"
                        @change="onSelectFile"
                      />
                    </div>
                    <v-col cols="12">
                      <v-text-field
                        v-model="form.name.value"
                        label="部屋の名前"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-switch
                        v-model="isPassword"
                        :label="`パスワードを${
                          isPassword ? '設定する' : '設定しない'
                        }`"
                      ></v-switch>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="form.password.value"
                        :disabled="!isPassword"
                        label="Password"
                        :required="isPassword"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-btn color="blue darken-1" text @click="dialog = false"
                  >閉じる</v-btn
                >
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="createRoom"
                  >部屋を公開する</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="failDialog" max-width="600px">
            <v-card>
              <v-card-title>
                <v-alert type="error">
                  部屋を立てることが出来ませんでした。
                </v-alert>
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="failDialog = false"
                  >閉じる</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>

        <v-dialog v-model="passwordDialog" max-width="450px">
          <v-card>
            <v-card-title>
              <span
                >「{{
                  tryToMoveRoom.name
                }}」のパスワードを入力してください</span
              >
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-text-field
                  label="パスワード"
                  :error-messages="errorMessages"
                  v-model="password"
                ></v-text-field>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-btn
                color="blue darken-1"
                text
                @click=";(passwordDialog = false), (password = null)"
                >閉じる</v-btn
              >
              <v-spacer></v-spacer>
              <v-btn
                color="blue darken-1"
                text
                @click="correctPassword(tryToMoveRoom.id)"
                >入室</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-main>
      <RoomsFooter @open-dialog="dialog = true"></RoomsFooter>
    </v-app>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useRoomsStore } from '~/store/rooms'
import UserHeader from '~/components/UserHeader'
import RoomsFooter from '~/components/RoomsFooter'

export default {
  async asyncData() {
    const unsubscribe = await useRoomsStore().subscribe()

    return {
      unsubscribe,
    }
  },
  destroyed() {
    useRoomsStore().clear()
    this.unsubscribe()
  },

  data() {
    return {
      errorMessages: '',
      tryToMoveRoom: {
        name: '',
        password: null,
        id: null,
      },
      dialog: false,
      passwordDialog: false,
      failDialog: false,
      isPassword: false,
      password: null,
      unsubscribe: null,
      form: {
        name: {
          label: '名前',
          value: null,
        },
        image: {
          label: '画像',
          value: null,
        },
        password: {
          label: 'パスワード',
          value: null,
        },
      },
    }
  },
  components: {
    UserHeader,
    RoomsFooter,
  },
  computed: {
    ...mapState(useRoomsStore, ['getterRooms']),
  },
  methods: {
    correctPassword(roomId) {
      const isPasswordEdited = this.getterRooms.find((r) => r.id === roomId)
      if (this.password === isPasswordEdited.password) {
        this.$router.push(`/room/${roomId}`)
      }
      this.errorMessages = 'パスワードが違います'
    },
    async moveToRoomPage(roomId) {
      const user = await this.$user()
      const userId = user.uid
      const isPasswordEdited = this.getterRooms.find((r) => r.id === roomId)
      if (userId === isPasswordEdited.hostId) {
        this.password = isPasswordEdited.password
      } else if (this.password !== isPasswordEdited.password) {
        this.errorMessages = ''
        this.passwordDialog = true
        this.tryToMoveRoom = {
          name: isPasswordEdited.name,
          password: isPasswordEdited.password,
          id: isPasswordEdited.id,
        }
        return
      }
      this.$router.push(`/room/${roomId}`)
    },
    selectImage() {
      this.$refs.image.click()
    },
    onSelectFile(e) {
      const files = e.target.files
      if (files.length === 0) return

      const reader = new FileReader()
      reader.readAsDataURL(files[0])

      reader.addEventListener('load', () => {
        this.upload({
          localImageFile: files[0],
        })
      })
    },
    async upload({ localImageFile }) {
      const user = await this.$auth()

      const storageRef = this.$fireStorage.ref()

      const imageRef = storageRef.child(
        `images/${user.uid}/rooms/${localImageFile.name}`,
      )

      const snapShot = await imageRef.put(localImageFile)
      this.form.image.value = await snapShot.ref.getDownloadURL()
    },
    async createRoom() {
      // ダイアログを閉じる
      this.dialog = false

      // 現在ログインしているユーザーを取得後、ログインしていなければページを移動
      const user = this.$fireAuth.currentUser
      if (!user) this.$router.push('/login')

      const params = {
        name: this.form.name.value,
        topImageUrl: this.form.image.value,
        createdAt: this.$firebase.firestore.FieldValue.serverTimestamp(),
        password: this.form.password.value,
        hostId: user.uid,
        startFirstHalf: false,
        finishFirstHalf: false,
        startSecondHalf: false,
        finishSecondHalf: false,
        delete: false,
        users: [],
      }

      try {
        await this.$firestore.collection('rooms').doc(user.uid).set(params)
      } catch (e) {
        this.failDialog = true
      }
    },
  },
}
</script>

<style scoped>
.main {
  margin-bottom: 200px;
}

.room-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 40px;
  object-fit: cover;
}

.image {
  position: relative;
  width: 10rem;
  height: 10rem;
  margin-left: auto;
  margin-right: auto;
  background: rgba(237, 242, 247, 1);
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close {
  position: absolute;
  top: -10px;
  right: -10px;
  /* top: -75px;
  right: -340px; */
  /* z-index: 100; */
  /* width: ; */
}

.icon {
  width: 10rem;
  height: 10rem;
  /* max-width: 100%; */
  /* height: 12rem; */
  /* max-height: 100%; */
  /* width: 200px; */
  /* height: 200px; */
  border-radius: 30px;
  object-fit: cover;
}

.v-speed-dial {
  position: absolute;
}

.v-btn--floating {
  position: relative;
}
</style>
