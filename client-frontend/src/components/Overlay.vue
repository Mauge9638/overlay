<template>
  <div :class="`overlay-container invisible`">
    <div>
      <h1 v-if="overlayChosen">
        {{ overlays[overlayChosenPropRef]?.question }}
      </h1>
      <div v-for="option in overlays[overlayChosenPropRef]?.options">
        <input
          v-model="overlayAnswerRef"
          :id="option.value"
          type="radio"
          :value="option.value"
        />
        <label :for="option.value">{{ option.label }}</label
        ><br />
      </div>
      <button @click="sendAnswer">Send svar</button>
    </div>
  </div>
  <!--  <div v-else-if="!overlayChosen" class="invisible"></div> -->
</template>

<script setup lang="ts">
import { onMounted, ref, toRef, watch } from "vue";
const props = defineProps({
  options: Object,
  title: String,
  overlayChosen: Number,
});
const optionPropRef = toRef(props, "options");
const titlePropRef = toRef(props, "title");
const overlayChosenPropRef = toRef(props, "overlayChosen");
const test = () => {
  console.log("test");
};

const overlays = {
  a71yP3dJbmaFfsMra7TR: {
    question: "What do u think?",
    options: [
      { label: "yes", value: "yes" },
      { label: "no", value: "no" },
      { label: "mby", value: "mby" },
      { label: "idk", value: "idk" },
    ],
  },
  YwfJuyDsRtpQQxduab8c: {
    question: "Favourite animal",
    options: [
      { label: "dog", value: "dog" },
      { label: "cat", value: "cat" },
      { label: "cow", value: "cow" },
      { label: "rabbit", value: "rabbit" },
    ],
  },
  EFryiW2ZMUxb_InlnkrP: {
    question: "Favourite color?",
    options: [
      { label: "black", value: "black" },
      { label: "red", value: "red" },
      { label: "blue", value: "blue" },
      { label: "white", value: "white" },
    ],
  },
  owGrQoXqtS2JKVoA1eMK: {
    question: "Least liked fruit?",
    options: [
      { label: "apple", value: "apple" },
      { label: "pear", value: "pear" },
      { label: "orange", value: "orange" },
      { label: "banana", value: "banana" },
      { label: "strawberry", value: "strawberry" },
      { label: "durian", value: "durian" },
    ],
  },
};

const overlayAnswerRef = ref("");

watch(overlayChosenPropRef, () => {
  document
    .getElementsByClassName(`overlay-container`)[0]
    .classList.remove("invisible");
});
const sendAnswer = () => {
  console.log(overlayAnswerRef.value);
  document
    .getElementsByClassName(`overlay-container`)[0]
    .classList.add("invisible");
  overlayAnswerRef.value = "";
};

onMounted(() => {
  /*   const list = document.getElementsByTagName("input")[0];
  list.style.background = optionPropRef.value?.css_styling.background; */
  setTimeout(() => {
    const overlay = document.getElementsByClassName("overlay")[0];
    document
      .getElementsByClassName("videoJsPlayer")[0]
      .getElementsByTagName("video-js")[0]
      .appendChild(overlay);
    const overlay2 = document.getElementsByClassName("overlay2")[0];
    document
      .getElementsByClassName("videoJsPlayer2")[0]
      .getElementsByTagName("video-js")[0]
      .appendChild(overlay2);
  }, 400);
});
</script>

<style scoped>
.overlay-container {
  padding: 2px;
  border: 4px solid rgb(138, 148, 194, 1);
  background: rgba(22, 44, 6, 1);
  height: fit-content;
  pointer-events: all;
  text-align: left;
}
.overlay-container label {
  @apply text-base;
}
.overlay-container button {
  @apply bg-slate-400 rounded-full border-2 border-solid border-indigo-700 text-base text-black hover:text-white hover:bg-slate-800;
}
</style>
