<script lang="ts">
import { useNuxtApp } from '#app'
import { mdiCloseCircle, mdiImage } from '@mdi/js'
import { ref, reactive, watch, inject } from '#imports'
import { RoomStatus } from '~/types/api'
import { waitingRoomRepo } from '~/apis/waitingRoom'
import { MESSAGES } from '~/constants/messages'
import { ErrorDialogStore, ErrorDialogKey } from '~/compositions/useErrorDialog'

export const isCreateRoomDialogOpen = ref<boolean>(false)
</script>

<script setup lang="ts">
type FormInputs = {
  name: string
  image: string
  password: string
  isPasswordSet: boolean
}

type Props = {
  modelValue: boolean
  userId: string
}
type Emits = {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  userId: '',
})
const emit = defineEmits<Emits>()

const { isErrorDialogOpen, errorMessage } = inject(
  ErrorDialogKey
) as ErrorDialogStore

const { $fireStorage, $firebase } = useNuxtApp()
const createDefaultFormInputs = (): FormInputs => ({
  name: '',
  image: '',
  password: '',
  isPasswordSet: false,
})

const formInputs = reactive<FormInputs>(createDefaultFormInputs())
const inputRef = ref<HTMLInputElement | null>(null)

const selectImage = () => {
  if (inputRef.value) {
    inputRef.value.click()
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
    `images/${props.userId}/rooms/${localImageFile.name}`
  )

  const snapShot = await imageRef.put(localImageFile)
  formInputs.image = await snapShot.ref.getDownloadURL()
}

const createRoom = async () => {
  // ダイアログを閉じる
  emit('update:modelValue', false)

  const status: RoomStatus = 'NOT_STARTED'
  const input = {
    name: formInputs.name,
    topImageUrl: formInputs.image,
    createdAt: $firebase.firestore.FieldValue.serverTimestamp(),
    password: formInputs.password,
    hostId: props.userId,
    delete: false,
    playerIds: [],
    status,
  }

  const { success } = await waitingRoomRepo.createRoom(input)
  if (!success) {
    isErrorDialogOpen.value = true
    errorMessage.value = MESSAGES.ROOM.CREATE.ERROR
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      Object.assign(formInputs, createDefaultFormInputs())
    }
  }
)
/**
 * init
 */
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600px"
    @click:outside="emit('update:modelValue', false)"
  >
    <v-card>
      <v-card-title class="py-4 px-6">
        <span class="text-h5">部屋を立てる</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <div class="image">
              <v-icon
                v-if="formInputs.image"
                size="30"
                class="close"
                :icon="mdiCloseCircle"
                @click="formInputs.image = ''"
              />
              <template v-if="formInputs.image">
                <img
                  class="icon"
                  :src="formInputs.image"
                  @click="selectImage"
                />
              </template>
              <template v-else>
                <v-icon
                  size="80"
                  :icon="mdiImage"
                  color="grey lighten-1"
                  @click="selectImage"
                />
              </template>
              <input
                ref="inputRef"
                type="file"
                style="display: none"
                accept="image/*"
                @change="onSelectFile"
              />
            </div>
            <v-col cols="12">
              <v-text-field
                v-model="formInputs.name"
                label="部屋の名前"
                variant="underlined"
              />
            </v-col>

            <v-col cols="12">
              <v-switch
                v-model="formInputs.isPasswordSet"
                :label="`パスワードを${
                  formInputs.isPasswordSet ? '設定する' : '設定しない'
                }`"
                color="primary"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="formInputs.password"
                :disabled="!formInputs.isPasswordSet"
                label="Password"
                :required="formInputs.isPasswordSet"
                variant="underlined"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="blue darken-1"
          text
          @click="emit('update:modelValue', false)"
          >閉じる</v-btn
        >
        <v-spacer />
        <v-btn color="blue darken-1" text @click="createRoom"
          >部屋を公開する</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.image {
  position: relative;
  width: 10rem;
  height: 10rem;
  margin-left: auto;
  margin-right: auto;
  background: rgba(237, 242, 247, 1);
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close {
  position: absolute;
  top: -10px;
  right: -10px;
  /* top: -75px;
  right: -340px; */
  /* z-index: 100; */
  /* width: ; */
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
