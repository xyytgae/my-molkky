<template>
  <v-dialog v-model="dialog" fullscreen hide-overlay>
    <v-card class="text-center" @click="clickScreen" dark>
      <v-card-text class="main">
        <transition>
          <div v-if="showChampion">
            <div class="text1"></div>
            <div class="word">YOU ARE THE</div>
          </div>
        </transition>

        <transition name="background">
          <div class="background" v-if="showChampion">
            <transition name="borders">
              <div class="borders" v-if="showBorders">
                <div class="border1"></div>
                <div class="border2"></div>
                <div class="border3"></div>
              </div>
            </transition>
            <div class="black-back"></div>
            <transition name="white">
              <div class="white-back" v-if="showChampion"></div>
            </transition>
          </div>
        </transition>

        <transition name="champion">
          <div class="champion" v-if="showText">CHAMPION</div>
        </transition>

        <div class="text2" v-if="showText">
          <span style="color: orange">★</span>を獲得しました！
        </div>
        <p v-if="showText">- - 画面をタップしてください - -</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: true,
      showChampion: false,
      showBorders: false,
      showText: false,

      timer: null,
      time: 0,
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.time++
      switch (this.time) {
        case 1:
          this.showChampion = true
          break

        case 2:
          this.showText = true
          break

        case 3:
          this.showBorders = true
          break
      }
      if (this.time >= 3) this.stopTimer()
    }, 1000)
  },
  methods: {
    clickScreen() {
      this.dialog = false
    },

    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.time = 0
        this.timer = 0
      }
    },
  },
}
</script>

<style scoped>
.main {
  position: absolute;
  top: 30%;
}

.borders-enter-active {
  transition: opacity 0.5s, transform 0.1s;
}

.borders-enter {
  opacity: 0;
  transform: translateY(-150px);
}

.word-enter-active,
.background-enter-active {
  transition: opacity 0.5s, transform 3s;
}

.word-enter,
.background-enter {
  opacity: 0;
  transform: translateX(-50px);
}

.champion-enter-active,
.white-enter-active {
  transition: opacity 0.5s, transform 0.3s;
}

.champion-enter,
.white-enter {
  opacity: 0;
  transform: translateX(50px);
}

.text1 {
  background: rgba(0, 0, 0, 0.6);
  position: relative;
  top: 20px;
  z-index: 1;
  width: 160px;
  height: 25px;
  margin: 0 auto;
  padding: 5px;
  transform: skew(30deg);
}

.text2 {
  font-size: 20px;
  color: white;
}

.word {
  font-size: 20px;
  color: white;
  position: relative;
  z-index: 2;
}

.black-back {
  position: absolute;
  top: -5px;
  right: -10px;
  background: rgba(0, 0, 0, 0.3);
  width: 300px;
  height: 80px;
}

.white-back {
  position: absolute;
  top: 15px;
  right: -35px;
  background: rgba(255, 255, 255, 0.1);
  width: 350px;
  height: 50px;
}

.border1 {
  position: absolute;
  right: 130px;
  top: -50px;
  transform: skew(30deg);
  background: rgba(255, 215, 0, 0.5);
  width: 25px;
  height: 140px;
}

.border2 {
  position: absolute;
  right: 70px;
  top: -30px;
  transform: skew(30deg);
  background: rgba(255, 215, 0, 0.5);
  width: 25px;
  height: 110px;
}

.border3 {
  position: absolute;
  right: 190px;
  top: -30px;
  transform: skew(30deg);
  background: rgba(255, 215, 0, 0.5);
  width: 25px;
  height: 110px;
}

.background {
  position: relative;
  display: inline-block;
  background: linear-gradient(to right, red, black 60%);
  transform: skew(20deg);
  width: 280px;
  height: 70px;
}

.background::before {
  content: '';
  position: absolute;
  right: 10%;
  top: 5px;
  width: 250px;
  height: 3px;
  background-color: white;
}

.background::after {
  content: '';
  position: absolute;
  left: 10%;
  bottom: 5px;
  width: 250px;
  height: 3px;
  background-color: white;
}

.champion {
  font-size: 50px;
  color: white;
  position: relative;
  top: -50px;
}

/* 「画面をタップしてください」の点滅の実装 */
p {
  margin-top: 100px;
  animation: anime 2s infinite alternate;
}

@keyframes anime {
  0% {
    color: white;
  }
  100% {
    color: rgba(255, 255, 255, 0);
  }
}
</style>
