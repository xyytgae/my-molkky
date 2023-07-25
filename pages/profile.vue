<script setup lang="ts">
import { useRouter } from '#app'
import {
  mdiAccountCircle,
  mdiCloseCircle,
  mdiHome,
  mdiAccount,
  mdiHistory,
} from '@mdi/js'
import { definePageMeta, ref, reactive, useUser } from '#imports'
import { onSelectFile } from '~/modules/onSelectFile'
import { userRepo } from '~/apis/user'
import { storageRepo } from '~/apis/storage'
import { Link } from '~/types/common'

type FormInputs = {
  name: string
  image: string
}

definePageMeta({
  middleware: ['check-auth'],
})

const LINKS: Link[] = [
  {
    title: 'ルーム',
    icon: 'custom:skittles',
    url: '/rooms',
  },
  {
    title: 'プロフィール変更',
    icon: mdiAccount,
    url: '/profile',
  },
  {
    title: 'ゲーム履歴',
    icon: mdiHistory,
    url: '/gameHistory',
  },
  {
    title: 'ホーム',
    icon: mdiHome,
    url: '/',
  },
]

const router = useRouter()
const { loginedUser } = useUser()

const isDrawerOpen = ref<boolean>(false)
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
  await userRepo.update({
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
    const { data } = await storageRepo.upload({
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
    <v-navigation-drawer v-model="isDrawerOpen" app clipped>
      <v-list>
        <v-list-item
          v-if="loginedUser"
          :title="loginedUser.name"
          class="my-4 text-black"
        >
          <template #prepend>
            <v-avatar
              v-if="loginedUser && loginedUser.iconImageUrl"
              :image="loginedUser.iconImageUrl"
              class="user-icon"
            />
            <v-icon
              v-else
              color="grey"
              class="user-icon"
              :icon="mdiAccountCircle"
            />
          </template>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list>
        <v-list-item v-for="link in LINKS" :key="link.title" :to="link.url">
          <template #prepend>
            <v-icon :icon="link.icon" color="black" size="x-large" />
          </template>
          <v-list-item-title class="text-subtitle-2 text-black">{{
            link.title
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar flat app>
      <template #prepend>
        <v-app-bar-nav-icon @click="isDrawerOpen = !isDrawerOpen" />
      </template>
      <v-app-bar-title>プロフィール編集</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-card elevation="0" max-width="400" class="d-flex py-12 mx-auto">
          <form class="mx-auto" @submit.prevent="onSubmit">
            <div v-if="formInputs.image" class="position-relative">
              <v-icon
                size="30"
                class="close-icon"
                :icon="mdiCloseCircle"
                @click="formInputs.image = ''"
              />
              <v-avatar class="editing-user-icon">
                <img :src="formInputs.image" @click="selectImage" />
              </v-avatar>
            </div>
            <v-icon
              v-else
              color="grey"
              class="editing-user-icon"
              :icon="mdiAccountCircle"
              @click="selectImage"
            />
            <input
              ref="inputRef"
              type="file"
              class="d-none"
              accept="image/*"
              @change="uploadImage"
            />
            <div>
              <v-text-field
                v-model="formInputs.name"
                label="名前"
                class="my-4"
                counter="8"
                :persistent-counter="true"
              />
            </div>

            <div class="text-center my-4">
              <span class="star"> ★ </span>
              ×{{ starCount }}
            </div>

            <v-btn color="forest-shade" block @click="onSubmit">保存</v-btn>
          </form>
        </v-card>
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.v-app-bar {
  border-bottom: 1px solid grey;
}
.v-main {
  background-color: rgb(var(--v-theme-warm-vanilla));
  height: 100vh;
}

.user-icon {
  width: 15vw;
  max-width: 48px;
  height: 15vw;
  max-height: 48px;
  border-radius: 50%;
  background-color: white;
}

.editing-user-icon {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background-color: white;
}

.editing-user-icon img {
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
