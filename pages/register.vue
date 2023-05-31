<script setup lang="ts">
import { useNuxtApp, useRouter } from '#app'
import { mdiAccountCircle } from '@mdi/js'
import { definePageMeta, ref, reactive, useUser } from '#imports'

definePageMeta({
  middleware: ['check-at-register'],
})

const router = useRouter()
const { loginedUser } = useUser()
const { $firestore, $fireStorage } = useNuxtApp()

const form = reactive({
  name: {
    label: 'プレイヤー名',
    value: null,
  },
  image: {
    label: 'アイコン画像',
    value: null,
  },
})
const image = ref<HTMLInputElement>()

const onSubmit = async () => {
  try {
    await $firestore.collection('users').doc(loginedUser.value!.uid).set({
      name: form.name.value,
      iconImageUrl: form.image.value,
      stars: 0,
    })
    router.push('/rooms')
  } catch (e) {
    console.log('失敗しました')
  }
}

const selectImage = () => {
  if (image.value) {
    image.value.click()
  }
}

// TODO: 型修正
const onSelectFile = (e: any) => {
  const files = e.target.files
  if (files.length === 0) return

  const reader = new FileReader()
  reader.readAsDataURL(files[0])

  reader.addEventListener('load', () => {
    upload({
      localImageFile: files[0],
    })
  })
}

// TODO: 型修正
const upload = async ({ localImageFile }: any) => {
  const storageRef = $fireStorage.ref()

  const imageRef = storageRef.child(
    `images/${loginedUser.value!.uid}/${localImageFile.name}`
  )

  const snapShot = await imageRef.put(localImageFile)
  form.image.value = await snapShot.ref.getDownloadURL()
}
</script>

<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-app-bar-title>アカウント登録</v-app-bar-title>
    </v-app-bar>

    <form class="v-form" @submit.prevent="onSubmit">
      <div class="form">
        <template v-if="form.image.value">
          <!-- <img
            class="w-32 h-32 object-cover border rounded-full"
            :src="form.image.value"
            @click="selectImage"
          /> -->
          <!-- <img :src="form.image.value" @click="selectImage" /> -->

          <v-avatar size="200">
            <img :src="form.image.value" @click="selectImage" />
          </v-avatar>
        </template>
        <template v-else>
          <v-icon
            color="grey"
            size="200"
            :icon="mdiAccountCircle"
            @click="selectImage"
          />
        </template>
        <input
          ref="image"
          type="file"
          style="display: none"
          accept="image/*"
          @change="onSelectFile"
        />
      </div>
      <div>
        <v-text-field
          v-model="form.name.value"
          label="プレイヤー名"
          counter="8"
          hide-details="auto"
        />
      </div>

      <div class="button">
        <v-btn color="primary" @click="onSubmit">登録</v-btn>
      </div>
    </form>
  </v-app>
</template>

<style scoped>
.v-form {
  margin: auto;
  /* justify-items: center; */
  /* justify-content: center; */
}

.form {
  text-align: center;
}

.image {
  border-radius: 50%;
}

.button {
  text-align: center;
}
</style>
