<script setup lang="ts">
import { useRouter } from '#app'
import { definePageMeta, ref, reactive, useUser } from '#imports'
import { onSelectFile } from '~/modules/onSelectFile'
import { userRepository } from '~/apis/user'
import { storageRepository } from '~/apis/storage'

type FormInputs = {
  name: string
  image: string
}

definePageMeta({
  middleware: ['check-auth'],
})

const router = useRouter()
const { loginedUser } = useUser()

const starCount = ref<number>(0)
const formInputs = reactive<FormInputs>({
  name: '',
  image: '',
})
const inputRef = ref<HTMLInputElement | null>(null)

const onSubmit = async () => {
  const input = {
    name: formInputs.name,
    iconImageUrl: formInputs.image,
    stars: starCount.value,
  }
  await userRepository.update({
    userId: loginedUser.value!.id,
    input,
  })
  router.push('/rooms')
}

const selectImage = () => {
  if (inputRef.value) {
    inputRef.value.click()
  }
}

const uploadImage = async (event: Event) => {
  const localImageFile = await onSelectFile(event)
  if (localImageFile) {
    const path = `${loginedUser.value!.id}/${localImageFile.name}`
    const { data } = await storageRepository.upload({
      file: localImageFile,
      path,
    })
    formInputs.image = data
  }
}

/**
 * init
 */
formInputs.name = loginedUser.value!.name
formInputs.image = loginedUser.value!.iconImageUrl
starCount.value = loginedUser.value!.stars
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
            <template v-if="formInputs.image">
              <img class="icon" :src="formInputs.image" @click="selectImage" />
            </template>
            <template v-else>
              <v-icon color="gray" size="150" @click="selectImage"
                >mdi-account-circle</v-icon
              >
            </template>
            <input
              ref="inputRef"
              type="file"
              style="display: none"
              accept="image/*"
              @change="uploadImage"
            />
          </div>
          <div>
            <v-text-field
              v-model="formInputs.name"
              label="プレイヤー名"
              class="mt-2"
              counter="8"
              variant="underlined"
              :persistent-counter="true"
            />
          </div>

          <div class="star">
            <span style="color: #ffa000"> ★ </span>
            ×{{ starCount }}
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
