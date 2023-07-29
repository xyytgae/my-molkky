<script setup lang="ts">
import { useRouter } from '#app'
import { mdiAccountCircle, mdiCloseCircle } from '@mdi/js'
import { definePageMeta, ref, reactive, useUser, watch } from '#imports'
import { onSelectFile } from '~/modules/onSelectFile'
import { userRepo } from '~/apis/user'
import { storageRepo } from '~/apis/storage'

type FormInputs = {
  name: string
  image: string
}

definePageMeta({
  middleware: ['check-auth'],
})

const router = useRouter()
const { loginedUser } = useUser()

const formInputs = reactive<FormInputs>({
  name: '',
  image: '',
})
const inputRef = ref<HTMLInputElement | null>(null)
const formRef = ref<HTMLFormElement | null>(null)
const isFormValid = ref<boolean>(false)

const rules = {
  required: (value: string) => !!value || '必須項目です',
  counter: (value: string) =>
    value.length <= 8 || '8文字以内で入力してください',
}

const onSubmit = async () => {
  if (!isFormValid.value) return
  const input = {
    name: formInputs.name,
    iconImageUrl: formInputs.image,
    stars: loginedUser.value!.stars,
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

// NOTE: v-model="isFormValid"の影響で、isFormValidがnullになるため一度強制的にvalidateを発火させる
watch(formRef, () => {
  if (formRef.value) {
    formRef.value.validate()
  }
})
</script>

<template>
  <div>
    <MainHeader>
      <v-app-bar-title>プロフィール編集</v-app-bar-title>
    </MainHeader>

    <v-main>
      <v-container>
        <v-card elevation="0" max-width="400" class="mx-auto">
          <v-form
            ref="formRef"
            v-model="isFormValid"
            class="mx-8 my-12"
            @submit.prevent="onSubmit"
          >
            <div class="d-flex">
              <div v-if="formInputs.image" class="position-relative mx-auto">
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
                class="editing-user-icon mx-auto"
                :icon="mdiAccountCircle"
                @click="selectImage"
              />
            </div>
            <input
              ref="inputRef"
              type="file"
              class="d-none"
              accept="image/*"
              @change="uploadImage"
            />
            <v-text-field
              v-model="formInputs.name"
              label="名前"
              class="my-4"
              counter="8"
              :persistent-counter="true"
              :rules="[rules.required, rules.counter]"
            />

            <v-btn
              class="mt-8"
              color="forest-shade"
              :disabled="!isFormValid"
              block
              @click="onSubmit"
              >保存</v-btn
            >
          </v-form>
        </v-card>
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.v-main {
  background-color: rgb(var(--v-theme-warm-vanilla));
  height: 100vh;
}

/* バリデーションエラー時のカウンターの幅調整 */
::v-deep(.v-counter) {
  min-width: fit-content;
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
