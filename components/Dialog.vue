<template>
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
                <template v-if="form.image.value">
                  <img
                    class="icon"
                    :src="form.image.value"
                    @click="selectImage"
                  />
                </template>
                <template v-else>
                  <!-- <v-icon size="200">mdi-file-image-outline</v-icon> -->
                  <v-icon size="80" @click="selectImage">mdi-image</v-icon>
                </template>
                <input
                  ref="image"
                  type="file"
                  style="display: none"
                  accept="image/*"
                  @change="onSelectFile"
                />
              </div>
              <!-- <v-col cols="12"> </v-col> -->
              <v-col cols="12">
                <v-text-field
                  v-model="form.name.value"
                  label="部屋の名前"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="isPassword"
                  :label="
                    `パスワードを${isPassword ? '設定する' : '設定しない'}`
                  "
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
          <v-btn color="blue darken-1" text @click="dialog = false"
            >部屋を公開する</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      isPassword: false,
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
  methods: {
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
  },
}
</script>

<style scoped>
.image {
  width: 10rem;
  /* width: 192px; */
  height: 10rem;
  /* height: 192px; */
  margin-left: auto;
  margin-right: auto;
  /* background: rgb(237, 242, 247); */
  background: rgba(237, 242, 247, 1);
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
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
</style>
