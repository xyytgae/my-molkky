<script lang="ts">
import { serverTimestamp } from 'firebase/firestore'
import { ref, reactive, watch, inject } from '#imports'
import { RoomStatus, Room } from '~/types/api'
import { roomRepo } from '~/apis/room'
import { MESSAGES } from '~/constants/messages'
import { ErrorDialogStore, ErrorDialogKey } from '~/compositions/useErrorDialog'

export const isCreateRoomDialogOpen = ref<boolean>(false)
</script>

<script setup lang="ts">
type FormInputs = {
  name: string
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

const createDefaultFormInputs = (): FormInputs => ({
  name: '',
})

const formInputs = reactive<FormInputs>(createDefaultFormInputs())

const createRoom = async () => {
  // ダイアログを閉じる
  emit('update:modelValue', false)

  const status: RoomStatus = 'NOT_STARTED'
  const input: Room = {
    id: '',
    name: formInputs.name,
    createdAt: serverTimestamp(),
    hostId: props.userId,
    delete: false,
    playerIds: [],
    status,
  }

  const { success } = await roomRepo.create({
    input,
  })
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
