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

const { $firebase } = useNuxtApp()
const createDefaultFormInputs = (): FormInputs => ({
  name: '',
  password: '',
  isPasswordSet: false,
})

const formInputs = reactive<FormInputs>(createDefaultFormInputs())

const createRoom = async () => {
  // ダイアログを閉じる
  emit('update:modelValue', false)

  const status: RoomStatus = 'NOT_STARTED'
  const input = {
    name: formInputs.name,
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

<style scoped></style>
