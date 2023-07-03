<script setup lang="ts">
import { useRouter } from '#app'

const router = useRouter()
</script>

<template>
  <div>
    <v-app-bar id="header" app elevation="0">
      <v-spacer />
      <v-btn text @click="router.push('/login')">ログイン</v-btn>
    </v-app-bar>

    <v-main>
      <v-container class="my-0 mx-auto pa-0">
        <v-row no-gutters>
          <v-col cols="12" xl="3" class="pa-0">
            <div id="title">
              <h1>My molkky</h1>
              <p>- モルック得点管理アプリ -</p>
            </div>
            <MolkkySkittles class="mx-auto" />
          </v-col>

          <v-col cols="12" xl="3">
            <v-card class="feature-container mx-2 my-8 pa-6">
              <v-card-title class="py-4 px-0">
                <h2 class="text-h5 text-md-h4 d-flex align-center">
                  <div class="ordered-number d-flex mr-2">1</div>
                  機能
                </h2>
              </v-card-title>
              <v-card-text class="px-6">
                <ul>
                  <li class="text-h6">
                    <h3 class="text-h6 mt-3">スコアを記録</h3>
                    <p class="text-subtitle-1 py-4">
                      スコアを記録するアプリです。スコアを記録して他のプレイヤーと対戦することができます。
                    </p>
                  </li>
                  <li class="text-h6">
                    <h3 class="text-h6 mt-3">自分のスコアのみでOK</h3>
                    <p class="text-subtitle-1 py-4">
                      自分のスコアのみを入力します。他のプレイヤーのスコアは、自動的にリアルタイムで表示されます。
                    </p>
                  </li>
                  <li class="text-h6">
                    <h3 class="text-h6 mt-3">スコア履歴</h3>
                    <p class="text-subtitle-1 py-4">
                      これまで対戦したスコアの結果を確認することができます。
                    </p>
                  </li>
                </ul>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" xl="3">
            <v-card class="feature-container mx-2 my-8 pa-6">
              <v-card-title class="py-4 px-0">
                <h2 class="text-h5 text-md-h4 d-flex align-center">
                  <div class="ordered-number d-flex mr-2">2</div>
                  オリジナルルール
                </h2>
              </v-card-title>
              <v-card-text class="px-0">
                <p class="text-subtitle-1 mb-4">
                  基本的な通常のモルックのルールに加えて、下記のルールを加えています。
                </p>
                <p class="text-subtitle-1">
                  先に50点を先取したチームは1ポイント獲得し、そのラウンドは終了となります。
                  <br />
                  獲得したポイントはそのままで、すべてのチームのスコアやスキットルの配置をリセットします。
                  <br />
                  先に2ポイント獲得したチームが勝利となり、ゲーム終了です。
                </p>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" xl="3">
            <v-card class="feature-container mx-2 my-8 pa-6">
              <v-card-title class="py-4 px-0">
                <h2 class="text-h5 text-md-h4 d-flex align-center">
                  <div class="ordered-number d-flex mr-2">3</div>
                  始めましょう！
                </h2>
              </v-card-title>
              <v-card-actions>
                <v-btn
                  variant="elevated"
                  class="mx-auto my-4 start-button"
                  size="large"
                  @click="router.push('/rooms')"
                  >START</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.v-app-bar {
  border-bottom: 1px solid grey;
}

.v-main {
  background-color: #f2e4cf;
}

.text-h4,
.text-h6,
.text-subtitle-1 {
  color: rgb(56, 81, 47);
}

.feature-container {
  background-color: rgb(254, 245, 231);
}

#title {
  z-index: 30;
  position: absolute;
  top: 8%;
  left: 5%;
  padding: 4px 16px;
  color: rgb(56, 81, 47);
  background-color: rgb(254, 245, 231);
  border-radius: 4px;
}

@media (min-width: 960px) {
  #title {
    margin-top: 32px;
    top: auto;
    left: 5%;
  }
}

.start-button {
  background-color: rgb(56, 81, 47);
  color: #f2e4cf;
  font-size: 1.5rem;
  padding: 8px 16px;
  border-radius: 4px;
}

.ordered-number {
  font-size: 2.5rem;
  font-weight: 800;
  min-width: 60px;
  width: 60px;
  height: 85px;
  border-radius: 50%;
  background: linear-gradient(#e9d5bd, #ecd5c1);
  color: #432e1d;
  justify-content: center;
  align-items: center;
}
</style>
