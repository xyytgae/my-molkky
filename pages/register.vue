<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>アカウント登録</v-toolbar-title>
    </v-app-bar>

    <form class="v-form" @submit.prevent="onSubmit">
      <div class="form">
        <template v-if="form.image.value">
          <!-- <img
            class="w-32 h-32 object-cover border rounded-full"
            :src="form.image.value"
            @click="selectImage"
          /> -->
          <!-- <img :src="form.image.value" @click="selectImage" /> -->

          <v-avatar size="200">
            <img :src="form.image.value" @click="selectImage" />
          </v-avatar>
        </template>
        <template v-else>
          <v-icon color="gray" size="200" @click="selectImage"
            >mdi-account-circle</v-icon
          >
        </template>
        <input
          ref="image"
          type="file"
          style="display: none"
          accept="image/*"
          @change="onSelectFile"
        />
      </div>
      <div>
        <v-text-field
          label="プレイヤー名"
          v-model="form.name.value"
          counter="8"
          hide-details="auto"
        ></v-text-field>
      </div>

      <div class="button">
        <v-btn color="primary" @click="onSubmit">登録</v-btn>
      </div>
    </form>
  </v-app>
</template>

<script>
import { mapState } from 'pinia'
import { useMainStore } from '~/store/main'

export default {
  middleware: ['checkRegister'],
  data() {
    return {
      form: {
        name: {
          label: 'プレイヤー名',
          value: null,
        },
        image: {
          label: 'アイコン画像',
          value: null,
        },
      },
    }
  },
  computed: {
    // TODO: 不要…？
    ...mapState(useMainStore, ['getterLogin_user']),
  },
  methods: {
    async onSubmit() {
      const user = await this.$auth()

      if (!user) this.$router.push('/login')

      try {
        await this.$firestore.collection('users').doc(user.uid).set({
          name: this.form.name.value,
          iconImageUrl: this.form.image.value,
          stars: 0,
        })
        this.$router.push('/')
      } catch (e) {
        console.log('失敗しました')
      }
    },
    selectImage() {
      this.$refs.image.click()
    },
    onSelectFile(e) {
      const files = e.target.files
      if (files.length === 0) return

      const reader = new FileReader()
      reader.readAsDataURL(files[0])

      reader.addEventListener('load', () => {
        this.upload({
          localImageFile: files[0],
        })
      })
    },
    async upload({ localImageFile }) {
      const user = await this.$auth()

      const storageRef = this.$fireStorage.ref()

      const imageRef = storageRef.child(
        `images/${user.uid}/${localImageFile.name}`,
      )

      const snapShot = await imageRef.put(localImageFile)
      this.form.image.value = await snapShot.ref.getDownloadURL()
    },
  },
}
</script>

<style scoped>
.v-form {
  margin: auto;
  /* justify-items: center; */
  /* justify-content: center; */
}

.form {
  text-align: center;
}

.image {
  border-radius: 50%;
}

.button {
  text-align: center;
}
</style>
