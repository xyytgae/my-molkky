<script setup lang="ts">
import { useNuxtApp, useRouter } from '#app'
import { definePageMeta, ref, reactive, useUser } from '#imports'

definePageMeta({
  middleware: ['check-auth'],
})
const router = useRouter()
const { $firestore, $fireStorage } = useNuxtApp()
const { loginedUser } = useUser()

const image = ref<HTMLInputElement | null>(null)
const form = reactive<{
  name: {
    label: string
    value: string | null
  }
  image: {
    label: string
    value: string | null
  }
  stars: {
    label: string
    value: number
  }
}>({
  name: {
    label: 'プレイヤー名',
    value: null,
  },
  image: {
    label: 'アイコン画像',
    value: null,
  },
  stars: {
    label: 'スター',
    value: 0,
  },
})

const onSubmit = async () => {
  try {
    await $firestore.collection('users').doc(loginedUser.value!.id).update({
      name: form.name.value,
      iconImageUrl: form.image.value,
      // stars: form.stars.value,
    })
    router.push('/rooms')
  } catch (e) {
    console.log('失敗しました')
    console.log(e)
  }
}

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
    `images/${loginedUser.value!.id}/${localImageFile.name}`
  )

  const snapShot = await imageRef.put(localImageFile)
  form.image.value = await snapShot.ref.getDownloadURL()
}

/**
 * init
 */
form.name.value = loginedUser.value!.name
form.image.value = loginedUser.value!.iconImageUrl
form.stars.value = loginedUser.value!.stars
</script>

<template>
  <div>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>プロフィール編集</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container class="d-flex justify-center align-center">
        <form class="form" @submit.prevent="onSubmit">
          <div class="image">
            <template v-if="form.image.value">
              <img class="icon" :src="form.image.value" @click="selectImage" />

              <!-- <v-avatar size="150" class="image">
            <img :src="form.image.value" @click="selectImage" />
          </v-avatar> -->
            </template>
            <template v-else>
              <!-- <v-avatar class="image" size="180">
            <img :src="getterLogin_user.photoURL" />
          </v-avatar>-->
              <v-icon color="gray" size="150" @click="selectImage"
                >mdi-account-circle</v-icon
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
          <div>
            <v-text-field
              v-model="form.name.value"
              label="プレイヤー名"
              class="mt-2"
              counter="8"
              variant="underlined"
              :persistent-counter="true"
            />
          </div>

          <div class="star">
            <span style="color: #ffa000"> ★ </span>
            ×{{ form.stars.value }}
          </div>

          <div class="button">
            <v-btn color="primary" @click="onSubmit">保存</v-btn>
          </div>
        </form>
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.form {
  margin: 150px auto auto;
}

.button {
  text-align: center;
}

.star {
  text-align: center;
}

.image {
  margin-left: auto;
  margin-right: auto;
  width: 10rem;
  height: 10rem;
}

.icon {
  width: 10rem;
  height: 10rem;
  border-radius: 80px;
}
</style>
