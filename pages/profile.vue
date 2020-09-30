<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>プロフィール編集</v-toolbar-title>
    </v-app-bar>
    <!-- <img class="image" :src="login_user.photoURL" rounded /> -->

    <!-- <v-avatar class="image" size="180">
      <img :src="login_user.photoURL" />
    </v-avatar>-->

    <!-- <div>
      <v-icon color="">mdi-star</v-icon>
      <span>×{{ form.stars.value }}</span>
    </div> -->

    <form class="form" @submit.prevent="onSubmit">
      <div class="star">
        <span>
          <v-icon color="#FFA000">mdi-star</v-icon>
          ×{{ form.stars.value }}</span
        >
      </div>
      <div class="image">
        <template v-if="form.image.value">
          <img class="icon" :src="form.image.value" @click="selectImage" />

          <!-- <v-avatar size="150" class="image">
            <img :src="form.image.value" @click="selectImage" />
          </v-avatar> -->
        </template>
        <template v-else>
          <!-- <v-avatar class="image" size="180">
            <img :src="login_user.photoURL" />
          </v-avatar>-->
          <v-icon color="gray" size="150" @click="selectImage"
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
        <v-btn color="primary" @click="onSubmit">保存</v-btn>
      </div>
    </form>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  // middleware: ['checkRegister'],
  created() {
    this.form.name.value = this.registered_user.name
    this.form.image.value = this.registered_user.iconImageUrl
    this.form.stars.value = this.registered_user.stars
  },
  computed: {
    ...mapGetters('main', ['login_user', 'registered_user']),
  },
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
        stars: {
          label: 'スター',
          value: 0,
        },
      },
    }
  },
  methods: {
    async onSubmit() {
      const user = await this.$auth()
      // console.log(user)

      if (!user) this.$router.push('/login')

      try {
        await this.$firestore
          .collection('users')
          .doc(user.uid)
          .update({
            name: this.form.name.value,
            iconImageUrl: this.form.image.value,
            // stars: this.form.stars.value,
          })
        this.$router.push('/')
      } catch (e) {
        console.log('失敗しました')
        console.log(e)
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
.form {
  margin: 150px auto auto;
}

.button {
  text-align: center;
}

.star {
  text-align: center;
}

.image {
  margin-left: auto;
  margin-right: auto;
  width: 10rem;
  height: 10rem;
}

.icon {
  width: 10rem;
  height: 10rem;
  border-radius: 80px;
}
</style>
