<script setup lang="ts">
import { useRouter } from '#app'
import { mdiAccountCircle, mdiCloseCircle } from '@mdi/js'
import {
  definePageMeta,
  ref,
  reactive,
  useUser,
  watch,
  onBeforeRouteLeave,
  computed,
} from '#imports'
import { onSelectFile } from '~/modules/onSelectFile'
import { userRepo } from '~/apis/user'
import { storageRepo } from '~/apis/storage'
import { useConfirm } from '~/composables/useConfirm'

type FormInputs = {
  name: string
  image: string
}

definePageMeta({
  middleware: ['check-auth'],
})

const router = useRouter()
const { loginedUser } = useUser()
const { onConfirm } = useConfirm()

const CONFIRM_TEXT = '編集内容が保存されていません。\n 編集を破棄しますか？'

const formInputs = reactive<FormInputs>({
  name: '',
  image: '',
})
const inputRef = ref<HTMLInputElement | null>(null)
const formRef = ref<HTMLFormElement | null>(null)
const isFormValid = ref<boolean>(false)
const isUpdated = ref<boolean>(false)

const rules = {
  required: (value: string) => !!value || '必須項目です',
  counter: (value: string) =>
    value.length <= 8 || '8文字以内で入力してください',
}

const isFormInputsChanged = computed<boolean>(() => {
  if (!loginedUser.value) return false
  return (
    formInputs.name !== loginedUser.value.name ||
    formInputs.image !== loginedUser.value.iconImageUrl
  )
})

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
  isUpdated.value = true
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

onBeforeRouteLeave(async (_to, _from, next) => {
  if (!isFormInputsChanged.value || isUpdated.value) {
    next()
    return
  }

  const answer = await onConfirm()
  if (answer) {
    next()
  } else {
    next(false)
  }
})

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
                <button type="button" @click="selectImage">
                  <v-avatar class="editing-user-icon">
                    <img :src="formInputs.image" alt="プロフィール写真" />
                  </v-avatar>
                </button>
              </div>

              <v-icon
                v-else
                color="grey"
                class="editing-user-icon mx-auto"
                :icon="mdiAccountCircle"
                @click="selectImage"
              />
            </div>
            <label class="d-none" for="image-input">
              <input
                id="image-input"
                ref="inputRef"
                type="file"
                accept="image/*"
                @change="uploadImage"
              />
            </label>

            <v-text-field
              v-model="formInputs.name"
              label="名前"
              class="my-4"
              counter="8"
              :persistent-counter="true"
              :rules="[rules.required, rules.counter]"
            />

            <v-btn
              type="submit"
              class="mt-8"
              color="forest-shade"
              :disabled="!isFormValid"
              block
              >保存</v-btn
            >
          </v-form>
        </v-card>
      </v-container>
      <LazyConfirmDialog :content="CONFIRM_TEXT" />
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
