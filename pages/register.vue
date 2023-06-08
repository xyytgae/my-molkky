<script setup lang="ts">
import { useRouter } from '#app'
import { mdiAccountCircle, mdiCloseCircle } from '@mdi/js'
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
          <form @submit.prevent="onSubmit">
            <div>
              <template v-if="formInputs.image">
                <v-icon
                  v-if="formInputs.image"
                  size="30"
                  class="close-icon"
                  :icon="mdiCloseCircle"
                  @click="formInputs.image = ''"
                />
                <v-avatar class="user-icon">
                  <img :src="formInputs.image" @click="selectImage" />
                </v-avatar>
              </template>
              <template v-else>
                <v-icon
                  color="grey"
                  class="user-icon"
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
                label="名前"
                class="my-4"
                counter="8"
                :persistent-counter="true"
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
form {
  margin: auto;
}

.button {
  text-align: center;
}

.user-icon {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background-color: white;
}

.user-icon img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.close-icon {
  position: absolute;
  z-index: 1;
  right: 0;
}
</style>
