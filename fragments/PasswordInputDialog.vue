<script lang="ts">
import { useRouter } from '#app'
import { ref, watch } from '#imports'
import { Room } from '~/types/api'
import { MESSAGES } from '~/constants/messages'

export const isPasswordInputDialogOpen = ref<boolean>(false)
</script>

<script setup lang="ts">
type Props = {
  modelValue: boolean
  selectedRoom: Room | null
}
type Emits = {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  selectedRoom: null,
})
const emit = defineEmits<Emits>()

const router = useRouter()

const roomEntryPasswordInput = ref<string>('')
const errorMessages = ref<string>('')

const verifyPassword = () => {
  if (
    props.selectedRoom &&
    roomEntryPasswordInput.value === props.selectedRoom.password
  ) {
    router.push(`/room/${props.selectedRoom.id}`)
  } else {
    errorMessages.value = MESSAGES.ROOM.ENTER.PASSWORD.INVALID
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      errorMessages.value = ''
      roomEntryPasswordInput.value = ''
    }
  }
)
/**
 * init
 */
</script>

<template>
  <v-dialog
    v-if="selectedRoom"
    :model-value="modelValue"
    max-width="450px"
    @click:outside="emit('update:modelValue', false)"
  >
    <v-card>
      <v-card-title class="py-4 px-6 text-wrap">
        <span class="text-h6"
          >「{{ selectedRoom.name }}」のパスワードを入力してください</span
        >
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-text-field
            v-model="roomEntryPasswordInput"
            label="パスワード"
            :error-messages="errorMessages"
            variant="underlined"
          />
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
        <v-btn color="blue darken-1" text @click="verifyPassword">入室</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
