<script setup lang="ts">
import { useNuxtApp, useRouter } from '#app'
import { ref, reactive } from '#imports'
import { useMainStore } from '~/store/main'

const router = useRouter()
const store = useMainStore()
const { $auth, $firestore, $fireStorage } = useNuxtApp()
const { getterLogin_user, getterRegistered_user } = store

const image = ref<HTMLInputElement>()
const form = reactive({
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
  const user = await $auth
  // console.log(user)

  if (!user) router.push('/login')

  try {
    await $firestore.collection('users').doc(user.uid).update({
      name: form.name.value,
      iconImageUrl: form.image.value,
      // stars: form.stars.value,
    })
    router.push('/')
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

const upload = async ({ localImageFile }: any) => {
  const user = await $auth

  const storageRef = $fireStorage.ref()

  const imageRef = storageRef.child(`images/${user.uid}/${localImageFile.name}`)

  const snapShot = await imageRef.put(localImageFile)
  form.image.value = await snapShot.ref.getDownloadURL()
}

/**
 * init
 */
form.name.value = getterRegistered_user.name
form.image.value = getterRegistered_user.iconImageUrl
form.stars.value = getterRegistered_user.stars
</script>

<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>プロフィール編集</v-toolbar-title>
    </v-app-bar>

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
          label="プレイヤー名"
          v-model="form.name.value"
          counter="8"
          hide-details="auto"
        ></v-text-field>
      </div>

      <div class="star">
        <span style="color: #ffa000"> ★ </span>
        ×{{ form.stars.value }}
      </div>

      <div class="button">
        <v-btn color="primary" @click="onSubmit">保存</v-btn>
      </div>
    </form>
  </v-app>
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
