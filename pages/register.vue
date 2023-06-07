<script setup lang="ts">
import { useRouter } from '#app'
import { mdiAccountCircle } from '@mdi/js'
import { definePageMeta, ref, reactive, useUser } from '#imports'
import { onSelectFile } from '~/modules/onSelectFile'
import { userRepository } from '~/apis/user'
import { storageRepository } from '~/apis/storage'

type FormInputs = {
  name: string
  image: string
}

definePageMeta({
  middleware: ['check-at-register'],
})

const router = useRouter()
const { loginedUser } = useUser()

const formInputs = reactive<FormInputs>({
  name: '',
  image: '',
})
const inputRef = ref<HTMLInputElement | null>(null)

const onSubmit = async () => {
  const input = {
    name: formInputs.name,
    iconImageUrl: formInputs.image,
    stars: 0,
  }
  await userRepository.create({
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
</script>

<template>
  <div>
    <v-app-bar app color="primary">
      <v-app-bar-title>アカウント登録</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container class="d-flex justify-center align-center py-12">
        <v-card elevation="0">
          <form class="v-form" @submit.prevent="onSubmit">
            <div class="form">
              <template v-if="formInputs.image">
                <v-avatar size="200">
                  <img :src="formInputs.image" @click="selectImage" />
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
                ref="inputRef"
                type="file"
                class="d-none"
                accept="image/*"
                @change="uploadImage"
              />
            </div>
            <div>
              <v-text-field
                v-model="formInputs.name"
                label="プレイヤー名"
                counter="8"
                hide-details="auto"
              />
            </div>

            <div class="button">
              <v-btn color="primary" @click="onSubmit">登録</v-btn>
            </div>
          </form>
        </v-card>
      </v-container>
    </v-main>
  </div>
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

.button {
  text-align: center;
}
</style>
