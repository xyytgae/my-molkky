<script setup lang="ts">
import { onMounted } from '#imports'
import { ALL_SKITTLES } from '~/constants/molkky'

const setFillHeight = () => {
  const headerHeight = document.getElementById('header')?.clientHeight
  const vh = (window.innerHeight - headerHeight!) * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}

onMounted(() => {
  // 初期化
  setFillHeight()
})

// 画面のサイズ変動の際、高さを再計算する
window.addEventListener('resize', setFillHeight)
</script>

<template>
  <div class="skittles-container">
    <div
      v-for="skittles in ALL_SKITTLES"
      :key="String(skittles)"
      class="skittles-row"
    >
      <div
        v-for="index in skittles"
        :id="`pin${index}`"
        :key="index"
        class="skittle"
      >
        <span class="skittle-number">{{ index }}</span>
        <div class="skittle-pin" />
      </div>
    </div>
    <!-- <div id="throwing-pin" /> -->
  </div>
</template>

<style scoped>
/* @import '../assets/styles/animation.css'; */

#title {
  z-index: 30;
  position: absolute;
  top: 10%;
  left: 5%;
  font-size: 2rem;
  padding: 4px 16px;
  color: rgb(56, 81, 47);
  background-color: rgb(254, 245, 231);
  border-radius: 4px;
}

.skittles-container {
  min-height: calc(var(--vh, 1vh) * 100);
  position: relative;
  padding-top: 300px;
  background: linear-gradient(#86c430, #92b267, #70994b);
  max-width: 80px;
}

.skittle {
  position: relative;
}

.skittles-row {
  display: flex;
  justify-content: center;
  align-items: center;
  /* スキットルの縦の間隔 */
  height: 80px;
}

/* 数字  */
.skittle-number {
  z-index: 12;
  font-size: 2.5rem;
  font-weight: 800;
  position: absolute;
  top: 0%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #432e1d;
}
/* 数字面  */
.skittle-pin::before {
  content: '';
  width: 60px;
  height: 85px;
  position: absolute;
  top: -40px;
  border-radius: 50%;
  background: linear-gradient(#e9d5bd, #ecd5c1);
}

/* 側面  */
.skittle-pin {
  width: 60px;
  height: 150px;
  position: relative;
  background: linear-gradient(#b1a074, #ac9060);
  margin: auto 2px;
}

/* 底面  */
.skittle-pin::after {
  content: '';
  width: 60px;
  height: 30px;
  position: absolute;
  top: 135px;
  border-radius: 50%;
  background: #ac9060;
}

#pin7,
#pin9,
#pin8 {
  z-index: 1;
}

#pin5,
#pin11,
#pin12,
#pin6 {
  z-index: 2;
}

#pin3,
#pin10,
#pin4 {
  z-index: 3;
}

#pin1,
#pin2 {
  z-index: 4;
}

/* #throwing-pin {
  z-index: 10;
  position: relative;
  border: 1px solid grey;
  background: linear-gradient(#e9d5bd, #ecd5c1);

  width: 100px;
  height: 30px;
  left: 50%;
  bottom: -250px;
  display: block;
  animation: throwing-pin 0.3s forwards cubic-bezier(0.18, 0.18, 0.27, 0.55);
  -webkit-animation: throwing-pin 0.3s forwards
    cubic-bezier(0.18, 0.18, 0.27, 0.55);
  animation-delay: 3s;
} */

/* #throwing-pin::before,
#throwing-pin::after {
  content: '';
  width: 20px;
  height: 28px;
  position: absolute;
  border-radius: 45px;
  background: linear-gradient(#e9d5bd, #ecd5c1);
}

#throwing-pin::before {
  left: -10px;
  border-left: 1px solid grey;
}

#throwing-pin::after {
  right: -10px;
  border-right: 1px solid grey;
} */

/* @keyframes throwing-pin {
  33% {
    transform: rotate(0deg);
    bottom: -200px;
  }
  66% {
    transform: rotate(0deg);
    bottom: -60px;
  }
  100% {
    transform: rotate(90deg);
    bottom: 0px;
  }
} */

/* Safari and Chrome: */
/* @-webkit-keyframes throwing-pin {
  33% {
    -webkit-transform: rotate(0deg);
    left: -200px;
  }
  66% {
    -webkit-transform: rotate(0deg);
    bottom: -60px;
  }
  100% {
    -webkit-transform: rotate(90deg);
    bottom: 0px;
  }
} */
</style>
