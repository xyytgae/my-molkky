<script setup lang="ts">
import { useNuxtApp } from '#app'
import { ref, reactive, useUser } from '#imports'

const { $fireStorage } = useNuxtApp()
const { loginedUser } = useUser()

const dialog = ref<boolean>(false)
const isPassword = ref<boolean>(false)
const form = reactive<{
  name: {
    label: string
    value: string | null
  }
  image: {
    label: string
    value: string | null
  }
  password: {
    label: string
    value: string | null
  }
}>({
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
})
const image = ref<HTMLInputElement | null>(null)

const selectImage = () => {
  if (image.value) {
    image.value.click()
  }
}

const onSelectFile = (e: Event) => {
  if (!(e.target instanceof HTMLInputElement)) {
    return
  }
  const files = e.target.files
  if (files === null || files.length === 0) return

  const reader = new FileReader()
  reader.readAsDataURL(files[0])

  reader.addEventListener('load', () => {
    upload({
      localImageFile: files[0],
    })
  })
}

const upload = async ({ localImageFile }: { localImageFile: File }) => {
  const storageRef = $fireStorage.ref()

  const imageRef = storageRef.child(
    `images/${loginedUser.value!.id}/rooms/${localImageFile.name}`
  )

  const snapShot = await imageRef.put(localImageFile)
  form.image.value = await snapShot.ref.getDownloadURL()
}
</script>

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
                <v-text-field v-model="form.name.value" label="部屋の名前" />
              </v-col>

              <v-col cols="12">
                <v-switch
                  v-model="isPassword"
                  :label="`パスワードを${
                    isPassword ? '設定する' : '設定しない'
                  }`"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.password.value"
                  :disabled="!isPassword"
                  label="Password"
                  :required="isPassword"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="dialog = false"
            >閉じる</v-btn
          >
          <v-spacer />
          <v-btn color="blue darken-1" text @click="dialog = false"
            >部屋を公開する</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

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
